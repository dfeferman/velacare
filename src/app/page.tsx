import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Accordion } from '@/components/ui/accordion'
import { LandingHero } from '@/components/landing/landing-hero'
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
      <LandingHero />

      <PflegekasseRechner />

      {/* Trust Strip — wireframes/01-startseite-hero-zuerst */}
      <div className="scrollbar-hide overflow-x-auto whitespace-nowrap border-b border-mid-gray/20 bg-terra-pale/50 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 text-[10px] font-medium text-warm-gray md:gap-0">
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            Gilt für alle gesetzlichen &amp; privaten Pflegekassen
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            Anspruch beginnt ab Pflegegradanerkennung
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            Ab sofort: 42 € monatlich — ohne Zuzahlung
          </div>
        </div>
      </div>

      <section className="scrollbar-hide overflow-x-auto whitespace-nowrap bg-dark py-6 text-terra-pale">
        <div className="mx-auto flex max-w-7xl justify-between gap-8 px-6 md:gap-12">
          {[
            { icon: '💶', title: '42 € / Monat', sub: 'Pflegekasse übernimmt alles' },
            { icon: '✓', title: '0 € Zuzahlung', sub: 'komplett kostenlos für Sie' },
            { icon: '🔓', title: 'Keine Bindung', sub: 'jederzeit pausieren' },
            { icon: '📦', title: 'Deutschlandweit', sub: 'versandkostenfrei' },
          ].map((item) => (
            <div key={item.title} className="flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terra/20 text-lg">{item.icon}</div>
              <div>
                <p className="text-sm font-bold leading-tight text-terra-pale">{item.title}</p>
                <p className="text-[10px] opacity-40">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* So funktioniert's — Layout wie Wireframe */}
      <section className="bg-bg px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-serif text-3xl font-bold text-dark">So funktioniert&apos;s</h2>
            <span className="text-sm font-medium text-warm-gray">3 einfache Schritte</span>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                title: 'Angaben machen',
                desc: 'Pflegegrad und Adresse eingeben — dauert 2 Minuten. Kein Papierkram nötig.',
              },
              {
                n: '2',
                title: 'Box wählen',
                desc: 'Wählen Sie aus, was Sie wirklich brauchen. Handschuhe, Desinfektion, Masken & mehr.',
              },
              {
                n: '3',
                title: 'Monatlich geliefert',
                desc: 'Wir regeln alles mit Ihrer Kasse. Ihre Box kommt automatisch jeden Monat direkt an die Haustür.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="group rounded-3xl border border-mid-gray/20 bg-warm-white p-8 transition-all hover:shadow-xl"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-terra/10 text-lg font-bold text-terra transition-colors group-hover:bg-terra group-hover:text-white">
                  {step.n}
                </div>
                <h3 className="mb-4 text-lg font-bold text-dark">{step.title}</h3>
                <p className="text-sm leading-relaxed text-warm-gray">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produkte-Teaser */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-serif text-3xl font-bold text-dark">Unsere Produkte</h2>
            <span className="text-sm font-medium text-warm-gray">Qualität für Ihre Pflege</span>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {MOCK_PRODUKTE.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-mid-gray/20 bg-warm-white transition-shadow hover:shadow-lg"
              >
                <div className="relative flex h-48 items-center justify-center bg-bg">
                  <span className="text-6xl text-terra/30" aria-hidden>
                    🧴
                  </span>
                  <div className="absolute left-4 top-4">
                    <span className="rounded bg-terra/10 px-2 py-0.5 text-[10px] font-bold uppercase text-terra">
                      Kostenlos
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="mb-1 text-sm font-bold text-dark">{p.name}</h4>
                  <p className="mb-4 text-[11px] leading-relaxed text-warm-gray">{p.beschreibung}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-terra">0,00 €</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/produkte" className="text-sm text-terra underline underline-offset-4 hover:text-terra-dark">
              Alle Produkte ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-warm-gray">Was unsere Kunden sagen</p>
        <h2 className="mb-12 text-center font-serif text-3xl font-semibold text-dark">Über 2.000 zufriedene Familien</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border border-mid-gray bg-warm-white p-6">
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.sterne }).map((_, i) => (
                  <span key={i} className="text-sm text-terra">
                    ★
                  </span>
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-dark">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terra-pale text-xs font-semibold text-terra">
                  {t.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-dark">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-warm-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center font-serif text-3xl font-semibold text-dark">Häufige Fragen</h2>
          <Accordion items={FAQ_ITEMS} />
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-sm text-terra underline underline-offset-4 hover:text-terra-dark">
              Alle Fragen ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA-Banner */}
      <section className="bg-terra px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold text-warm-white md:text-4xl">Bereit für Ihre erste Box?</h2>
          <p className="mb-8 text-warm-white/70">Kostenlos beantragen — in weniger als 3 Minuten.</p>
          <Button variant="secondary" className="border-warm-white px-8 py-3 text-base text-warm-white hover:bg-warm-white hover:text-terra">
            <Link href="/beantragen">Jetzt Anspruch prüfen</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
