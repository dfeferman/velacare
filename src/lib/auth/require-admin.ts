// src/lib/auth/require-admin.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/')

  const { data: levels } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (levels?.nextLevel === 'aal2' && levels?.currentLevel !== 'aal2') {
    redirect('/login/mfa')
  }

  return user
}
