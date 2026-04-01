import Link from 'next/link'

export default function DankePage() {
  return (
    <div className="min-h-screen bg-v2-surface font-manrope flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success icon */}
        <div className="w-16 h-16 bg-v2-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-v2-primary" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-newsreader text-3xl text-v2-on-surface text-center mb-3">
          Vielen Dank für Ihr Vertrauen
        </h1>

        {/* E-Mail-Bestätigungs-Hinweis */}
        <div className="bg-v2-surface-lowest rounded-xl px-6 py-5 mb-6 text-sm text-v2-on-surface-v">
          <p className="font-medium text-v2-on-surface mb-1">Bitte bestätigen Sie Ihre E-Mail-Adresse</p>
          <p>
            Wir haben Ihnen eine Bestätigungs-E-Mail geschickt. Bitte klicken Sie auf den Link
            in dieser E-Mail, um Ihr Konto zu aktivieren. Erst danach kann Ihr Antrag bearbeitet werden.
          </p>
        </div>

        {/* Nächste Schritte */}
        <div className="bg-v2-surface-lowest rounded-xl px-6 py-5 mb-8">
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Was passiert als nächstes?</h2>
          <ol className="space-y-3">
            {[
              { n: 1, text: 'Wir prüfen Ihren Antrag und die Erstattungsfähigkeit.' },
              { n: 2, text: 'Sie erhalten eine Bestätigung mit Ihrem Liefertermin.' },
              { n: 3, text: 'Ihre erste Box wird monatlich geliefert — kostenlos.' },
            ].map(step => (
              <li key={step.n} className="flex gap-3">
                <span className="w-6 h-6 bg-v2-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </span>
                <span className="text-sm text-v2-on-surface-v">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium hover:bg-v2-secondary transition-colors inline-block"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
