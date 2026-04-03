'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginMitPasswort(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    return { error: 'E-Mail und Passwort sind erforderlich.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `Anmeldung fehlgeschlagen: ${error.message}`
          : 'E-Mail oder Passwort nicht korrekt.',
    }
  }

  const rolle = data.user?.app_metadata?.rolle as string | undefined
  revalidatePath('/', 'layout')

  if (rolle === 'admin' || rolle === 'superadmin') {
    redirect('/admin')
  }
  redirect('/konto')
}
