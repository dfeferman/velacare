// src/app/api/cron/monthly-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { MonatsErinnerungEmail } from '@/emails/monats-erinnerung'
import { decrypt } from '@/lib/crypto/field-encryption'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.APP_URL
  if (!appUrl) {
    return NextResponse.json({ error: 'APP_URL is not set' }, { status: 500 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monatLabel = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const startedAt = Date.now()
  const adminClient = createAdminClient()

  // Aktive Kunden ohne Lieferung im laufenden Monat
  const kunden = await prisma.kundenProfile.findMany({
    where: {
      lieferung_status: 'aktiv',
      lieferungen: {
        none: { erstellt_am: { gte: startOfMonth, lte: endOfMonth } },
      },
    },
    select: { id: true, user_id: true, vorname: true },
  })

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const kunde of kunden) {
    // Idempotenz: bereits versendet in diesem Monat?
    const alreadySent = await prisma.emailDelivery.findUnique({
      where: {
        kind_kundeId_periodKey: {
          kind: 'monthly-reminder',
          kundeId: kunde.id,
          periodKey,
        },
      },
    })

    if (alreadySent) {
      skipped++
      continue
    }

    try {
      // E-Mail-Adresse aus Supabase Auth holen
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
        kunde.user_id
      )
      if (authError || !authUser.user?.email) {
        console.error('Kein Auth-User gefunden:', { kundeId: kunde.id, error: authError?.message })
        failed++
        continue
      }

      const providerMsgId = await sendEmail({
        to: authUser.user.email,
        subject: `Dein Budget für ${monatLabel} wartet – Velacare`,
        template: MonatsErinnerungEmail({
          vorname: decrypt(kunde.vorname),
          monat: monatLabel,
          kontoUrl: `${appUrl}/konto/meine-box`,
        }),
      })

      await prisma.emailDelivery.create({
        data: {
          kind: 'monthly-reminder',
          kundeId: kunde.id,
          periodKey,
          providerMsgId,
        },
      })

      sent++
    } catch (error) {
      failed++
      console.error('Monats-Erinnerung fehlgeschlagen:', {
        kundeId: kunde.id,
        periodKey,
        error,
      })
    }
  }

  const durationMs = Date.now() - startedAt
  console.info('monthly-reminder abgeschlossen:', {
    periodKey,
    total: kunden.length,
    sent,
    skipped,
    failed,
    durationMs,
  })

  return NextResponse.json({ periodKey, total: kunden.length, sent, skipped, failed })
}
