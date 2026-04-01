'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // createBrowserClient detects #access_token hash fragment automatically.
    // getSession() triggers that processing and resolves once the session is set.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/konto')
      } else {
        router.replace('/login?error=link-ungueltig')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF]">
      <p className="text-[#6B5747] font-sans">Anmeldung läuft…</p>
    </div>
  )
}
