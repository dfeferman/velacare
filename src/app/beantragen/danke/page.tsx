import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DankePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      {/* Success section */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-sage-pale rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-sage font-bold">✓</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-dark mb-6 leading-tight">
          Vielen Dank für Ihr Vertrauen
        </h1>
        <p className="text-warm-gray text-lg max-w-xl mx-auto leading-relaxed">
          Ihre Anfrage ist erfolgreich bei uns eingegangen. Wir haben Ihnen eine Bestätigungs-E-Mail mit allen Details zugesandt.
        </p>
      </div>

      {/* What happens next */}
      <div className="mb-16">
        <h2 className="font-serif text-3xl text-dark text-center mb-10">
          Was passiert als nächstes?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-warm-white rounded-xl p-6 border border-mid-gray relative overflow-hidden">
            <span className="absolute top-2 right-4 text-7xl font-serif text-terra/10 leading-none select-none">
              1
            </span>
            <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🏦</span>
            </div>
            <h3 className="font-serif text-xl text-dark mb-2">Prüfung</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Wir kontaktieren Ihre Pflegekasse zur Bestätigung Ihres Anspruchs (ca. 3–5 Werktage).
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-warm-white rounded-xl p-6 border border-mid-gray relative overflow-hidden">
            <span className="absolute top-2 right-4 text-7xl font-serif text-terra/10 leading-none select-none">
              2
            </span>
            <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">✉️</span>
            </div>
            <h3 className="font-serif text-xl text-dark mb-2">Bestätigung</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Sie erhalten eine E-Mail-Bestätigung sobald Ihr Antrag genehmigt wurde.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-warm-white rounded-xl p-6 border border-mid-gray relative overflow-hidden">
            <span className="absolute top-2 right-4 text-7xl font-serif text-terra/10 leading-none select-none">
              3
            </span>
            <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">📦</span>
            </div>
            <h3 className="font-serif text-xl text-dark mb-2">Versand</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Ihre erste Pflegehilfsmittel-Box wird zum gewünschten Termin an Sie versendet.
            </p>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="bg-mid-gray/30 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-serif italic text-3xl md:text-4xl text-dark mb-4">
          Helfen Sie anderen weiter
        </h2>
        <p className="text-warm-gray max-w-lg mx-auto leading-relaxed">
          Kennen Sie jemanden in Ihrem Umfeld, dem Velacare ebenfalls helfen könnte?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/beantragen">
            <Button variant="primary">Für jemanden beantragen</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
