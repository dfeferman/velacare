// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type === 'magiclink') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}/konto`)
    }

    console.error('Magic Link verifyOtp fehlgeschlagen:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=link-ungueltig`)
}
