import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SCHRITTE = [
  {
    num: 1,
    title: 'Angaben machen',
    desc: 'Pflegegrad und Versicherungsart eingeben. In weniger als 2 Minuten prüfen wir Ihren gesetzlichen Anspruch nach § 40 SGB XI.',
  },
  {
    num: 2,
    title: 'Antrag prüfen',
    desc: 'Wir kontaktieren Ihre Pflegekasse und stellen den Antrag für Sie. Kein Papierkram, kein Aufwand für Sie.',
  },
  {
    num: 3,
    title: 'Box zusammenstellen',
    desc: 'Wählen Sie aus unserem Sortiment genau die Produkte, die Sie monatlich benötigen. Ihr Budget wird live angezeigt.',
  },
  {
    num: 4,
    title: 'Monatliche Lieferung',
    desc: 'Ihre Pflegebox kommt pünktlich jeden Monat zum gewünschten Datum. Jederzeit flexibel anpassbar.',
  },
]

const VORAUSSETZUNGEN = [
  {
    title: 'Pflegegrad 1–5',
    desc: 'Ein anerkannter Pflegegrad ist Voraussetzung. Ab Pflegegrad 1 haben Sie Anspruch.',
  },
  {
    title: 'Häusliche Pflege',
    desc: 'Die Pflege muss zuhause stattfinden. Stationäre Pflegeheime sind ausgenommen.',
  },
  {
    title: 'Alle gesetzlichen Kassen',
    desc: 'Alle gesetzlichen Krankenkassen nehmen teil. Privat Versicherte wenden sich direkt an ihre Kasse.',
  },
]

export default function WieEsFunktioniertPage() {
  return (
    <div className="bg-bg">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-xs text-warm-gray">
          <Link href="/" className="hover:text-terra transition-colors">Startseite</Link>
          <span>›</span>
          <span className="text-dark">Wie es funktioniert</span>
        </nav>
      </div>

      {/* Inner Hero */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-xs tracking-widest uppercase text-warm-gray mb-3">Schritt für Schritt</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-dark mb-4">
          In 4 einfachen Schritten<br />zu Ihrer Pflegebox
        </h1>
        <p className="text-warm-gray text-lg max-w-xl">
          Wir übernehmen den kompletten Antragsprozess — Sie müssen nichts weiter tun als Ihre Box zusammenzustellen.
        </p>
      </section>

      {/* Timeline + Sticky Bild */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start">
          {/* Timeline */}
          <div className="space-y-0">
            {SCHRITTE.map((schritt, i) => (
              <div key={schritt.num} className="flex gap-6">
                {/* Linie + Kreis */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-terra text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 z-10">
                    {schritt.num}
                  </div>
                  {i < SCHRITTE.length - 1 && (
                    <div className="w-px flex-1 bg-terra/20 my-2" style={{ minHeight: '48px' }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-10">
                  <h3 className="font-serif text-xl font-semibold text-dark mb-2">{schritt.title}</h3>
                  <p className="text-warm-gray leading-relaxed">{schritt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky rechte Spalte */}
          <div className="md:sticky md:top-20 space-y-4">
            {/* Bild-Placeholder */}
            <div className="aspect-[3/4] bg-terra-pale rounded-2xl flex items-center justify-center">
              <div className="text-center text-terra/40">
                <div className="text-5xl mb-2">📦</div>
                <p className="text-sm font-medium">Pflegebox</p>
              </div>
            </div>
            {/* Info-Card */}
            <div className="bg-sage-pale border border-sage-light rounded-xl p-5">
              <p className="font-semibold text-sage text-sm mb-1">Alles unter Kontrolle</p>
              <p className="text-xs text-sage/70 leading-relaxed">
                Sie behalten jederzeit die volle Kontrolle. Box anpassen, pausieren oder beenden — wann immer Sie möchten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Voraussetzungen */}
      <section className="bg-warm-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-semibold mb-10">Voraussetzungen</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VORAUSSETZUNGEN.map(v => (
              <div key={v.title} className="bg-bg rounded-xl border border-mid-gray p-6">
                <div className="w-8 h-8 rounded-full bg-terra-pale flex items-center justify-center text-terra mb-4">✓</div>
                <h3 className="font-semibold text-dark mb-2">{v.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA-Banner */}
      <section className="bg-terra py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-semibold text-warm-white mb-4">Bereit für Ihre erste Box?</h2>
          <p className="text-warm-white/70 mb-8">Kostenlos beantragen — in weniger als 3 Minuten.</p>
          <Button variant="secondary" className="border-warm-white text-warm-white hover:bg-warm-white hover:text-terra px-8 py-3">
            <Link href="/beantragen">Jetzt Anspruch prüfen</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
