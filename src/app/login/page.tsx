'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFehler(null)
    setLaden(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwort,
    })

    if (error) {
      setFehler('E-Mail oder Passwort nicht korrekt.')
      setLaden(false)
      return
    }

    const rolle = data.user?.app_metadata?.rolle as string | undefined
    router.refresh()

    if (rolle === 'admin' || rolle === 'superadmin') {
      router.push('/admin')
    } else {
      router.push('/konto')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-mid-gray bg-warm-white p-8">
        <h1 className="mb-1 font-serif text-2xl font-semibold text-dark">Anmelden</h1>
        <p className="mb-6 text-sm text-warm-gray">Willkommen zurück bei Velacare.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-mid-gray bg-bg px-3 py-2.5 text-sm text-dark placeholder:text-warm-gray focus:border-terra focus:outline-none"
              placeholder="ihre@email.de"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark">Passwort</label>
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-mid-gray bg-bg px-3 py-2.5 text-sm text-dark placeholder:text-warm-gray focus:border-terra focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {fehler && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {fehler}
            </p>
          )}

          <button
            type="submit"
            disabled={laden}
            className="w-full rounded-md bg-terra py-2.5 text-sm font-medium text-warm-white transition-colors hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {laden ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-warm-gray hover:text-dark">
            ← Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
