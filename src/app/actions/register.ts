'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'
import type { BoxProdukt } from '@/lib/types'
import { sendEmail } from '@/lib/email/sender'
import { BestellbestaetigungEmail } from '@/emails/bestellbestaetigung'
import { encryptKundenProfile } from '@/lib/crypto/field-encryption'
import { writeAuditLog } from '@/lib/dal/audit'

export async function registerKunde(
  produkte: BoxProdukt[],
  liefertag: number,
  step2: Step2Data
): Promise<{ error?: string }> {

  // 0. Server-side validation — never trust client data
  const result = registerSchema.safeParse(step2)
  if (!result.success) return { error: 'Ungültige Eingabedaten.' }
  const d = result.data

  // 1. Supabase Auth — generate magic link (no password)
  const admin = createAdminClient()

  const appUrl = process.env.APP_URL ?? 'http://localhost:3001'

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: d.email,
    options: { redirectTo: `${appUrl}/auth/callback` },
  })

  if (linkError || !linkData?.user?.id) {
    const msg = linkError?.message?.toLowerCase() ?? ''
    if (msg.includes('already registered') || msg.includes('user already exists')) {
      return { error: 'Diese E-Mail-Adresse ist bereits registriert.' }
    }
    console.error('generateLink fehlgeschlagen:', linkError?.message)
    return { error: 'Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' }
  }

  // Save auth user ID for potential compensation if Prisma transaction fails
  let authUserId: string | undefined

  try {
    authUserId = linkData.user.id
    const actionLink = linkData.properties?.action_link

    // 2. Set app_metadata.rolle = 'kunde' via Admin API (server-only)
    await admin.auth.admin.updateUserById(authUserId, {
      app_metadata: { rolle: 'kunde' },
    })

    // 3. Prisma interactive transaction: KundenProfile → BoxKonfiguration → Einwilligungen
    const headersList = await headers()
    const ipAdresse = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0'
    const userAgent = headersList.get('user-agent') ?? 'funnel-v2'
    const gesamtpreis = produkte.reduce((sum, item) => sum + Number(item.produkt.preis) * item.anzahl, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kundenProfileId: string = await prisma.$transaction(async (tx: any) => {

      // 3a. KundenProfile upsert (idempotent: safe on retry or DB-trigger race)
      const encryptedFields = encryptKundenProfile({
        vorname:      d.vorname,
        nachname:     d.nachname,
        geburtsdatum: d.geburtsdatum,
        pflegegrad:   String(d.pflegegrad),
      })

      const profile = await tx.kundenProfile.upsert({
        where:  { user_id: authUserId },
        create: {
          user_id:              authUserId,
          vorname:              encryptedFields.vorname,
          nachname:             encryptedFields.nachname,
          geburtsdatum:         encryptedFields.geburtsdatum,
          pflegegrad:           encryptedFields.pflegegrad,
          krankenkasse:         d.krankenkasse,
          versicherungsnummer:  d.versicherungsnummer,
          strasse:              d.strasse,
          hausnummer:           d.hausnummer,
          adresszusatz:         d.adresszusatz,
          plz:                  d.plz,
          ort:                  d.ort,
          telefon:              d.telefon,
          versorgungssituation: d.versorgungssituation,
          beratung:             d.beratung,
          lieferadresse_json:   d.lieferadresse_abweichend ? d.lieferadresse ?? null : null,
          lieferstichtag:       liefertag,
        },
        update: {
          vorname:              encryptedFields.vorname,
          nachname:             encryptedFields.nachname,
          geburtsdatum:         encryptedFields.geburtsdatum,
          pflegegrad:           encryptedFields.pflegegrad,
          krankenkasse:         d.krankenkasse,
          versicherungsnummer:  d.versicherungsnummer,
          strasse:              d.strasse,
          hausnummer:           d.hausnummer,
          adresszusatz:         d.adresszusatz,
          plz:                  d.plz,
          ort:                  d.ort,
          telefon:              d.telefon,
          versorgungssituation: d.versorgungssituation,
          beratung:             d.beratung,
          lieferadresse_json:   d.lieferadresse_abweichend ? d.lieferadresse ?? null : null,
          lieferstichtag:       liefertag,
        },
      })

      // 3b. BoxKonfiguration: kunde_id references KundenProfile.id (UUID primary key)
      await tx.boxKonfiguration.create({
        data: {
          kunde_id:    profile.id,
          produkte:    produkte as object,
          gesamtpreis,
        },
      })

      // 3c. Einwilligungen — skipDuplicates protects against retry / double-submit
      await tx.einwilligung.createMany({
        data: [
          { user_id: authUserId, typ: 'agb',   version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
          { user_id: authUserId, typ: 'dsgvo',  version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
        ],
        skipDuplicates: true,
      })

      return profile.id as string
    })

    // Best-effort AuditLog — never blocks registration on failure
    try {
      await writeAuditLog({
        aktion:      'kunde_registriert',
        entitaet:    'KundenProfile',
        entitaet_id: kundenProfileId,
        userId:      authUserId,
        ipAdresse:   ipAdresse,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (registerKunde):', e)
    }

    // Kombinierte E-Mail: Bestellbestätigung + Magic Link
    if (actionLink) {
      try {
        await sendEmail({
          to: d.email,
          subject: 'Dein Antrag ist eingegangen – Velacare',
          template: BestellbestaetigungEmail({
            vorname: d.vorname,
            nachname: d.nachname,
            pflegegrad: d.pflegegrad,
            budgetGenutzt: Math.round(gesamtpreis * 100),
            magicLinkUrl: actionLink,
            expiresInMinutes: 60,
          }),
        })
      } catch (emailError) {
        console.error('Bestellbestätigung/MagicLink konnte nicht gesendet werden:', {
          email: d.email,
          error: emailError,
        })
        // Registrierung trotzdem erfolgreich — kein Fehler zurückgeben
      }
    }

  } catch (error) {
    // Compensation: delete orphaned auth user if Prisma transaction (or subsequent steps) failed
    if (authUserId) {
      await admin.auth.admin.deleteUser(authUserId).catch((compError) => {
        console.error('Compensation fehlgeschlagen — Auth-User konnte nicht gelöscht werden:', {
          authUserId,
          error: compError,
        })
      })
    }

    console.error('registerKunde() fehlgeschlagen:', error)
    return { error: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.' }
  }

  // Redirect happens outside try/catch — Next.js throws internally on redirect()
  redirect('/beantragen/danke')
}
