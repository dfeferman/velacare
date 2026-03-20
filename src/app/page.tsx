import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_PRODUKTE } from '@/lib/mock-data'

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-terra/5" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs tracking-[0.2em] uppercase text-terra-light mb-8">
            Pflegehilfsmittel · Kostenlos · Monatlich
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold text-warm-white leading-tight mb-4">
            Pflege, die jeden<br />Monat ankommt.
          </h1>
          <p className="text-warm-white/50 font-light text-lg max-w-xl mx-auto mb-10">
            Velacare liefert Ihnen monatlich kostenlose Pflegehilfsmittel — bezahlt von Ihrer Pflegekasse. Einfach beantragen, wir erledigen den Rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" className="text-base px-8 py-3">
              <Link href="/beantragen">Jetzt kostenlos beantragen</Link>
            </Button>
            <Button variant="secondary" className="text-base px-8 py-3 border-warm-white/20 text-warm-white/70 hover:bg-warm-white/5">
              <Link href="/wie-es-funktioniert">Wie es funktioniert</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Badge variant="terra">Pflegegrad 1–5</Badge>
            <Badge variant="sage">Bis 42 € monatlich</Badge>
            <Badge variant="gray" className="text-warm-white/40 bg-warm-white/5">Gesetzlich versichert</Badge>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">So einfach geht&apos;s</p>
        <h2 className="font-serif text-4xl font-semibold text-center mb-16">In 3 Schritten zur Box</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Anspruch prüfen', desc: 'Pflegegrad eingeben, fertig. Wir prüfen sofort ob Sie Anspruch haben — in weniger als 30 Sekunden.' },
            { num: '02', title: 'Box zusammenstellen', desc: 'Wählen Sie aus unserem Sortiment genau das, was Sie monatlich brauchen. Ihr Budget wird live angezeigt.' },
            { num: '03', title: 'Monatlich geliefert', desc: 'Wir kümmern uns um den Antrag bei Ihrer Pflegekasse. Sie erhalten Ihre Box pünktlich jeden Monat.' },
          ].map(step => (
            <div key={step.num} className="text-center">
              <div className="font-serif text-5xl font-semibold text-terra/20 mb-4">{step.num}</div>
              <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-warm-gray text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produkte-Teaser */}
      <section className="py-16 px-6 bg-warm-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-warm-gray mb-3">Aus unserem Sortiment</p>
          <h2 className="font-serif text-4xl font-semibold mb-12">Was in Ihrer Box sein kann</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_PRODUKTE.slice(0, 3).map(p => (
              <div key={p.id} className="bg-bg rounded-lg p-5 border border-mid-gray">
                <Badge variant="terra" className="mb-3">{p.kategorie}</Badge>
                <h4 className="font-medium text-sm mb-1">{p.name}</h4>
                <p className="text-xs text-warm-gray">{p.beschreibung}</p>
                <div className="mt-3 text-sm font-medium text-terra">{p.preis.toFixed(2).replace('.', ',')} €</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/produkte" className="text-sm text-terra hover:text-terra-dark underline underline-offset-4">
              Alle Produkte ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust-Sektion */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-semibold mb-4">Weil die wichtigsten Menschen<br />die beste Pflege verdienen.</h2>
        <p className="text-warm-gray max-w-xl mx-auto mb-10">Hinter jedem Auftrag steckt eine Familie. Velacare kommuniziert warm, persönlich und auf Augenhöhe.</p>
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Jetzt beantragen — kostenlos</Link>
        </Button>
      </section>
    </>
  )
}
