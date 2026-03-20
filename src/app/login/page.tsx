import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="text-center max-w-sm">
        <h1 className="font-serif text-3xl font-semibold mb-3">Anmelden</h1>
        <p className="text-warm-gray text-sm mb-6">Login wird in Phase 2 implementiert (NextAuth.js).</p>
        <div className="bg-amber-pale border border-amber rounded-lg p-4 text-sm text-amber mb-6">
          Demo-Modus: <Link href="/konto" className="underline">Direkt zum Kundenkonto</Link> oder <Link href="/admin" className="underline">zum Admin-Panel</Link>
        </div>
        <Link href="/" className="text-xs text-warm-gray hover:text-dark">← Zur Startseite</Link>
      </div>
    </div>
  )
}
