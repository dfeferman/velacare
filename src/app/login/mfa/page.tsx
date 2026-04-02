'use client'

import { useActionState } from 'react'
import { verifyMfa } from './actions'

export default function MfaPage() {
  const [state, action] = useActionState(verifyMfa, undefined)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-newsreader text-2xl text-dark mb-2">2-Faktor-Authentifizierung</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Gib den aktuellen Code aus deiner Authenticator-App ein.
        </p>
        <form action={action} className="space-y-4">
          <input
            type="text"
            name="code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            required
            placeholder="000000"
            className="w-full px-4 py-3 border border-outline rounded-lg text-center text-2xl tracking-widest font-mono"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-medium">
            Bestätigen
          </button>
        </form>
      </div>
    </div>
  )
}
