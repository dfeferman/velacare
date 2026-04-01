// src/lib/email/sender.ts
import { render } from '@react-email/components'
import { getResendClient } from './resend'
import type { ReactElement } from 'react'

interface SendEmailOptions {
  to: string
  subject: string
  template: ReactElement
}

export async function sendEmail({ to, subject, template }: SendEmailOptions): Promise<string> {
  const from = process.env.RESEND_FROM
  if (!from) {
    throw new Error('RESEND_FROM is not set')
  }

  const html = await render(template)
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({ from, to, subject, html })

  if (error || !data?.id) {
    throw new Error(
      `E-Mail-Versand fehlgeschlagen an ${to}: ${error?.message ?? 'kein data.id'}`
    )
  }

  return data.id  // Resend Message-ID für Logging
}
