'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginMitPasswort } from './actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginMitPasswort, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-mid-gray bg-warm-white p-8">
        <h1 className="mb-1 font-serif text-2xl font-semibold text-dark">Anmelden</h1>
        <p className="mb-6 text-sm text-warm-gray">Willkommen zurück bei Velacare.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-dark">
              E-Mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-mid-gray bg-bg px-3 py-2.5 text-sm text-dark placeholder:text-warm-gray focus:border-terra focus:outline-none"
              placeholder="ihre@email.de"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-dark">
              Passwort
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-mid-gray bg-bg px-3 py-2.5 text-sm text-dark placeholder:text-warm-gray focus:border-terra focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-terra py-2.5 text-sm font-medium text-warm-white transition-colors hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Wird angemeldet…' : 'Anmelden'}
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
