import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion } from '@/components/ui/accordion'
import { PflegekasseRechner } from '@/components/landing/pflegekasse-rechner'
import { MOCK_PRODUKTE } from '@/lib/mock-data'

const FAQ_ITEMS = [
  { frage: 'Ist der Service wirklich kostenlos?', antwort: 'Ja, vollständig. Die Pflegekasse übernimmt bis zu 42 € monatlich nach § 40 SGB XI. Für Sie entstehen keinerlei Kosten oder Zuzahlungen.' },
  { frage: 'Wer hat Anspruch auf Pflegehilfsmittel?', antwort: 'Alle Personen mit einem anerkannten Pflegegrad 1–5, die zuhause gepflegt werden und gesetzlich krankenversichert sind.' },
  { frage: 'Wie kann ich meine Box jederzeit ändern?', antwort: 'Über Ihr persönliches Kundenkonto können Sie die Zusammenstellung Ihrer Box jederzeit anpassen. Änderungen gelten ab der nächsten Lieferung.' },
  { frage: 'Brauche ich ein Rezept oder Attest?', antwort: 'Nein. Wir kümmern uns um den gesamten Antragsprozess bei Ihrer Pflegekasse. Sie brauchen nur Ihren Pflegegradnachweis.' },
  { frage: 'Wie kündige ich den Service?', antwort: 'Es gibt keine Vertragsbindung. Sie können den Service jederzeit formlos per E-Mail oder Telefon beenden.' },
]

const TESTIMONIALS = [
  { name: 'Maria H.', text: 'Endlich ein Service, der wirklich funktioniert. Ich hatte keine Ahnung, dass mir das zusteht. Seit 6 Monaten erhalte ich meine Box pünktlich jeden Monat.', sterne: 5 },
  { name: 'Klaus W.', text: 'Die Anmeldung war in 3 Minuten erledigt. Das Team hat alles mit der Pflegekasse geregelt. Sehr empfehlenswert!', sterne: 5 },
  { name: 'Ingrid S.', text: 'Ich pflege meinen Mann zuhause und dachte immer, das wäre zu kompliziert. Velacare hat mir gezeigt, wie einfach es geht.', sterne: 5 },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero — Split Layout */}
      <section className="bg-bg pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Links: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-sage-pale text-sage text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              Gesetzlicher Anspruch ab Pflegegrad 1
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-dark leading-tight mb-4">
              Pflegehilfsmittel kostenlos — jeden Monat nach Hause.
            </h1>
            <p className="text-warm-gray text-lg leading-relaxed mb-6">
              Bis zu <strong className="text-dark">42 € monatlich</strong> von Ihrer Pflegekasse. Wir beantragen alles für Sie — kostenlos und ohne Aufwand.
            </p>
            {/* Mini-Schritte */}
            <div className="flex items-center gap-2 text-xs text-warm-gray mb-8">
              {['Angaben machen', 'Box wählen', 'Monatlich geliefert'].map((s, i) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-terra text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
                  <span>{s}</span>
                  {i < 2 && <span className="text-mid-gray">→</span>}
                </span>
              ))}
            </div>
            <Button variant="primary" className="text-base px-8 py-3">
              <Link href="/beantragen">Anspruch prüfen — kostenlos &amp; unverbindlich</Link>
            </Button>
          </div>

          {/* Rechts: Foto-Placeholder mit Floating-Badges */}
          <div className="relative">
            <div className="aspect-[4/5] bg-terra-pale rounded-[40px] rounded-bl-none overflow-hidden flex items-center justify-center">
              <div className="text-center text-terra/30">
                <div className="text-6xl mb-2">📦</div>
                <p className="text-sm font-medium">Foto Pflegebox</p>
              </div>
            </div>
            {/* Floating Badge 1 */}
            <div className="absolute -left-4 top-1/4 bg-warm-white rounded-xl shadow-lg px-4 py-3 border border-mid-gray">
              <p className="font-serif text-2xl font-semibold text-terra">42 €</p>
              <p className="text-xs text-warm-gray">monatlich kostenlos</p>
            </div>
            {/* Floating Badge 2 */}
            <div className="absolute -right-4 bottom-1/4 bg-warm-white rounded-xl shadow-lg px-4 py-3 border border-mid-gray">
              <p className="text-xs font-medium text-dark">✓ Keine</p>
              <p className="text-xs text-warm-gray">Vertragsbindung</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-warm-white border-y border-mid-gray py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '€', label: '42 € / Monat', sub: 'Ihr gesetzlicher Anspruch' },
            { icon: '0', label: '0 € Zuzahlung', sub: 'Pflegekasse zahlt alles' },
            { icon: '∞', label: 'Keine Bindung', sub: 'Jederzeit kündbar' },
            { icon: '🚚', label: 'Versandkostenfrei', sub: 'Deutschlandweit' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-terra-pale flex items-center justify-center text-terra font-bold text-sm flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">{item.label}</p>
                <p className="text-xs text-warm-gray">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pflegekasse-Rechner */}
      <PflegekasseRechner />

      {/* So funktioniert's */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Einfach und schnell</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center mb-12">So funktioniert&apos;s</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Angaben machen', desc: 'Pflegegrad und Wohnort angeben. In weniger als 2 Minuten prüfen wir Ihren Anspruch.' },
            { num: '02', title: 'Box zusammenstellen', desc: 'Wählen Sie aus unserem Sortiment genau die Produkte, die Sie monatlich brauchen.' },
            { num: '03', title: 'Monatlich geliefert', desc: 'Wir stellen den Antrag bei Ihrer Pflegekasse. Ihre Box kommt pünktlich jeden Monat.' },
          ].map(step => (
            <div key={step.num} className="bg-warm-white rounded-xl border border-mid-gray p-6">
              <div className="font-serif text-4xl font-semibold text-terra/20 mb-3">{step.num}</div>
              <h3 className="font-semibold text-dark mb-2">{step.title}</h3>
              <p className="text-sm text-warm-gray leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produkte-Teaser */}
      <section className="py-16 px-6 bg-warm-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-warm-gray mb-3">Unser Sortiment</p>
          <h2 className="font-serif text-3xl font-semibold mb-10">Was in Ihrer Box sein kann</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_PRODUKTE.slice(0, 4).map(p => (
              <div key={p.id} className="bg-bg rounded-xl border border-mid-gray p-5">
                <div className="w-10 h-10 bg-terra-pale rounded-lg flex items-center justify-center mb-3 text-xl">📦</div>
                <Badge variant="sage" className="mb-2 text-xs">Kostenlos</Badge>
                <h4 className="font-medium text-sm text-dark mb-1">{p.name}</h4>
                <p className="text-xs text-warm-gray leading-relaxed">{p.beschreibung}</p>
                <p className="mt-2 text-sm font-semibold text-terra">0,00 €</p>
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

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Was unsere Kunden sagen</p>
        <h2 className="font-serif text-3xl font-semibold text-center mb-12">Über 2.000 zufriedene Familien</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-warm-white rounded-xl border border-mid-gray p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.sterne }).map((_, i) => (
                  <span key={i} className="text-terra text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-dark leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-terra-pale flex items-center justify-center text-xs font-semibold text-terra">
                  {t.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-dark">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-warm-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-semibold text-center mb-10">Häufige Fragen</h2>
          <Accordion items={FAQ_ITEMS} />
          <div className="text-center mt-8">
            <Link href="/faq" className="text-sm text-terra hover:text-terra-dark underline underline-offset-4">
              Alle Fragen ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA-Banner */}
      <section className="py-20 px-6 bg-terra">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-4">
            Bereit für Ihre erste Box?
          </h2>
          <p className="text-warm-white/70 mb-8">Kostenlos beantragen — in weniger als 3 Minuten.</p>
          <Button variant="secondary" className="text-base px-8 py-3 border-warm-white text-warm-white hover:bg-warm-white hover:text-terra">
            <Link href="/beantragen">Jetzt Anspruch prüfen</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
