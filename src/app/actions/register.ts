'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'
import type { BoxProdukt } from '@/lib/types'

export async function registerKunde(
  produkte: BoxProdukt[],
  liefertag: number,
  step2: Step2Data
): Promise<{ error?: string }> {

  // 0. Server-side validation — never trust client data
  const result = registerSchema.safeParse(step2)
  if (!result.success) return { error: 'Ungültige Eingabedaten.' }
  const d = result.data

  // 1. Supabase Auth signup
  const supabase = await createClient()
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: d.email,
    password: d.passwort,
  })

  if (signUpError) {
    const msg = signUpError.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already exists')) {
      return { error: 'Diese E-Mail-Adresse ist bereits registriert.' }
    }
    return { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Registrierung fehlgeschlagen.' }

  // 2. Set app_metadata.rolle = 'kunde' via Admin API (server-only)
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { rolle: 'kunde' },
  })

  // 3. Prisma interactive transaction: KundenProfile → BoxKonfiguration → Einwilligungen
  const headersList = await headers()
  const ipAdresse = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0'
  const userAgent = headersList.get('user-agent') ?? 'funnel-v2'
  const gesamtpreis = produkte.reduce((sum, item) => sum + Number(item.produkt.preis), 0)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {

      // 3a. KundenProfile upsert (idempotent: safe on retry or DB-trigger race)
      const profile = await tx.kundenProfile.upsert({
        where:  { user_id: userId },
        create: {
          user_id:              userId,
          vorname:              d.vorname,
          nachname:             d.nachname,
          geburtsdatum:         new Date(d.geburtsdatum),
          pflegegrad:           d.pflegegrad,
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
          vorname:              d.vorname,
          nachname:             d.nachname,
          geburtsdatum:         new Date(d.geburtsdatum),
          pflegegrad:           d.pflegegrad,
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
          { user_id: userId, typ: 'agb',   version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
          { user_id: userId, typ: 'dsgvo',  version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
        ],
        skipDuplicates: true,
      })
    })
  } catch {
    return { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }
  }

  // Redirect happens outside try/catch — Next.js throws internally on redirect()
  redirect('/beantragen/danke')
}
