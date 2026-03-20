import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DankePage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-sage-pale rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h1 className="font-serif text-4xl font-semibold mb-4">Antrag eingegangen!</h1>
        <p className="text-warm-gray leading-relaxed mb-8">
          Vielen Dank für Ihre Anfrage. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Unser Team meldet sich in Kürze bei Ihnen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">
            <Link href="/konto">Zum Kundenkonto</Link>
          </Button>
          <Button variant="secondary">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
