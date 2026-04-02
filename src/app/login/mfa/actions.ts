'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyMfa(_prevState: unknown, formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totpFactor = factors?.totp?.[0]

  if (!totpFactor) {
    redirect('/admin')
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id,
  })

  if (challengeError || !challenge) {
    return { error: 'Challenge fehlgeschlagen. Bitte erneut versuchen.' }
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challenge.id,
    code,
  })

  if (verifyError) {
    return { error: 'Ungültiger Code. Bitte prüfe deine Authenticator-App.' }
  }

  redirect('/admin')
}
