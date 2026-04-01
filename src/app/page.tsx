import Link from 'next/link'
import { Accordion } from '@/components/ui/accordion'
import { LandingHero } from '@/components/landing/landing-hero'
import { PflegekasseRechner } from '@/components/landing/pflegekasse-rechner'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { MOCK_PRODUKTE } from '@/lib/mock-data'

// ── Data ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    frage: 'Ist der Service wirklich kostenlos?',
    antwort:
      'Ja, vollständig. Die Pflegekasse übernimmt bis zu 42 € monatlich nach § 40 SGB XI. Für Sie entstehen keinerlei Kosten oder Zuzahlungen.',
  },
  {
    frage: 'Wer hat Anspruch auf Pflegehilfsmittel?',
    antwort:
      'Alle Personen mit einem anerkannten Pflegegrad 1–5, die zuhause gepflegt werden und gesetzlich krankenversichert sind.',
  },
  {
    frage: 'Wie kann ich meine Box jederzeit ändern?',
    antwort:
      'Über Ihr persönliches Kundenkonto können Sie die Zusammenstellung Ihrer Box jederzeit anpassen. Änderungen gelten ab der nächsten Lieferung.',
  },
  {
    frage: 'Brauche ich ein Rezept oder Attest?',
    antwort:
      'Nein. Wir kümmern uns um den gesamten Antragsprozess bei Ihrer Pflegekasse. Sie brauchen nur Ihren Pflegegradnachweis.',
  },
  {
    frage: 'Wie kündige ich den Service?',
    antwort:
      'Es gibt keine Vertragsbindung. Sie können den Service jederzeit formlos per E-Mail oder Telefon beenden.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Maria H.',
    text: 'Endlich ein Service, der wirklich funktioniert. Ich hatte keine Ahnung, dass mir das zusteht. Seit 6 Monaten erhalte ich meine Box pünktlich jeden Monat.',
    sterne: 5,
  },
  {
    name: 'Klaus W.',
    text: 'Die Anmeldung war in 3 Minuten erledigt. Das Team hat alles mit der Pflegekasse geregelt. Sehr empfehlenswert!',
    sterne: 5,
  },
  {
    name: 'Ingrid S.',
    text: 'Ich pflege meinen Mann zuhause und dachte immer, das wäre zu kompliziert. Velacare hat mir gezeigt, wie einfach es geht.',
    sterne: 5,
  },
]

const SCHRITTE = [
  {
    n: '1',
    title: 'Angaben machen',
    desc: 'Pflegegrad und Adresse eingeben — dauert 2 Minuten. Kein Papierkram nötig.',
  },
  {
    n: '2',
    title: 'Box zusammenstellen',
    desc: 'Wählen Sie aus, was Sie wirklich brauchen. Handschuhe, Desinfektion, Masken und mehr.',
  },
  {
    n: '3',
    title: 'Monatlich geliefert',
    desc: 'Wir regeln alles mit Ihrer Kasse. Ihre Box kommt automatisch jeden Monat direkt an die Haustür.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <ScrollReveal />

      <LandingHero />

      {/* ── Trust Strip ───────────────────────────────────────────── */}
      <div
        className="scrollbar-hide overflow-x-auto whitespace-nowrap py-3"
        style={{
          background: '#EEF4F1',
          borderBottom: '1px solid rgba(213,202,185,0.25)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 text-[10px] font-medium text-v3-on-surface-v md:gap-0">
          {[
            'Gilt für alle gesetzlichen & privaten Pflegekassen',
            'Anspruch beginnt ab Pflegegradanerkennung',
            'Ab sofort: 42 € monatlich — ohne Zuzahlung',
          ].map((text) => (
            <div key={text} className="flex shrink-0 items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-v3-primary flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <PflegekasseRechner />

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div
        className="scrollbar-hide overflow-x-auto whitespace-nowrap py-6"
        style={{ background: '#1A120D' }}
      >
        <div className="mx-auto flex max-w-7xl justify-between gap-8 px-6 md:gap-12">
          {[
            { icon: '€', title: '42 € / Monat', sub: 'Pflegekasse übernimmt alles' },
            { icon: '✓', title: '0 € Zuzahlung', sub: 'komplett kostenlos für Sie' },
            { icon: '↺', title: 'Keine Bindung', sub: 'jederzeit pausieren' },
            { icon: '⟶', title: 'Deutschlandweit', sub: 'versandkostenfrei' },
          ].map((item) => (
            <div key={item.title} className="flex shrink-0 items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-v3-primary flex-shrink-0"
                style={{ background: 'rgba(74,114,89,0.18)' }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: '#FFFDF7' }}>
                  {item.title}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,253,247,0.35)' }}>
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── So funktioniert's ─────────────────────────────────────── */}
      <section className="bg-v3-section-warm px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 reveal">
            <span
              className="mb-3 inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-v3-primary"
              style={{ background: 'rgba(74,114,89,0.1)' }}
            >
              In 3 Schritten
            </span>
            <div className="flex items-baseline justify-between">
              <h2 className="font-newsreader text-3xl font-semibold text-v3-on-surface md:text-4xl">
                So funktioniert&apos;s
              </h2>
              <Link
                href="/wie-es-funktioniert"
                className="hidden text-sm font-medium text-v3-primary hover:underline sm:block"
              >
                Alle Details →
              </Link>
            </div>
            <div className="deco-rule mt-3" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SCHRITTE.map((step, i) => (
              <div
                key={step.n}
                className={`card-lift rounded-2xl bg-v3-surface p-8 reveal reveal-d${i + 1}`}
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  boxShadow: '0 1px 6px rgba(38,30,23,0.05)',
                }}
              >
                <div
                  className="mb-6 flex h-11 w-11 items-center justify-center rounded-full font-newsreader text-lg font-bold text-white"
                  style={{
                    background: '#4A7259',
                    boxShadow: '0 4px 12px rgba(74,114,89,0.25)',
                  }}
                >
                  {step.n}
                </div>
                <h3 className="mb-3 font-newsreader text-xl font-semibold text-v3-on-surface">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-v3-on-surface-v">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produkte Teaser ───────────────────────────────────────── */}
      <section className="bg-v3-background px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 reveal">
            <span
              className="mb-3 inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-v3-secondary"
              style={{ background: 'rgba(158,90,53,0.1)' }}
            >
              Sortiment
            </span>
            <div className="flex items-baseline justify-between">
              <h2 className="font-newsreader text-3xl font-semibold text-v3-on-surface md:text-4xl">
                Unsere Produkte
              </h2>
              <Link
                href="/produkte"
                className="hidden text-sm font-medium text-v3-primary hover:underline sm:block"
              >
                Alle ansehen →
              </Link>
            </div>
            <div className="deco-rule mt-3" />
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {MOCK_PRODUKTE.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className={`card-lift overflow-hidden rounded-2xl bg-v3-surface reveal reveal-d${i + 1}`}
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  boxShadow: '0 1px 6px rgba(38,30,23,0.05)',
                }}
              >
                <div className="relative flex h-44 items-center justify-center bg-v3-section-warm">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
                    style={{ background: 'rgba(255,253,247,0.8)' }}
                  >
                    🧴
                  </div>
                  <div className="absolute left-3 top-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-v3-primary"
                      style={{ background: 'rgba(74,114,89,0.12)' }}
                    >
                      Kostenlos
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="mb-1 text-sm font-semibold text-v3-on-surface">{p.name}</h4>
                  <p className="mb-4 text-[11px] leading-relaxed text-v3-on-surface-v">{p.beschreibung}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-newsreader text-sm font-bold text-v3-primary">0,00 €</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/produkte"
              className="text-sm font-medium text-v3-primary underline underline-offset-4 hover:text-v3-primary-mid"
            >
              Alle Produkte ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section
        className="px-6 py-20"
        style={{ background: '#F5EDE5' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center reveal">
            <span
              className="mb-3 inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(158,90,53,0.12)', color: '#9E5A35' }}
            >
              Kundenstimmen
            </span>
            <h2 className="font-newsreader text-3xl font-semibold text-v3-on-surface md:text-4xl">
              Über 2.000 zufriedene Familien
            </h2>
            <div className="mt-3 flex justify-center">
              <div className="deco-rule" />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`card-lift rounded-2xl bg-v3-surface p-7 reveal reveal-d${i + 1}`}
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  boxShadow: '0 1px 6px rgba(38,30,23,0.05)',
                }}
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.sterne }).map((_, j) => (
                    <span key={j} className="text-sm" style={{ color: '#9E5A35' }}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-v3-on-surface">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: '#F5EDE5', color: '#9E5A35' }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-v3-on-surface">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-v3-surface px-6 py-20" style={{ borderTop: '1px solid rgba(213,202,185,0.15)' }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center reveal">
            <h2 className="font-newsreader text-3xl font-semibold text-v3-on-surface">
              Häufige Fragen
            </h2>
            <div className="mt-3 flex justify-center">
              <div className="deco-rule" />
            </div>
          </div>
          <Accordion items={FAQ_ITEMS} />
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="text-sm font-medium text-v3-primary underline underline-offset-4 hover:text-v3-primary-mid"
            >
              Alle Fragen ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div
          className="rounded-3xl px-10 py-16 text-center relative overflow-hidden reveal md:px-20"
          style={{
            background: '#EEF4F1',
            border: '1px solid rgba(74,114,89,0.2)',
            boxShadow: '0 4px 24px rgba(74,114,89,0.10)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(74,114,89,0.08) 0, transparent 70%)',
            }}
          />
          <div className="relative">
            <span
              className="mb-6 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-v3-primary"
              style={{ border: '1px solid rgba(74,114,89,0.25)', background: 'rgba(74,114,89,0.1)' }}
            >
              Jetzt starten
            </span>
            <h2 className="font-newsreader text-3xl font-semibold text-v3-on-surface leading-[1.1] mb-4 md:text-4xl">
              Bereit für Ihre erste Box?
            </h2>
            <p className="mb-8 text-sm font-light leading-relaxed text-v3-on-surface-v max-w-xl mx-auto md:text-base">
              In wenigen Klicks prüfen wir Ihren Anspruch und übernehmen den Rest. Kostenlos, unverbindlich und ohne Vertragsbindung.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/beantragen"
                className="ripple-btn inline-flex items-center gap-2.5 rounded-xl bg-v3-primary px-8 py-4 font-semibold text-white transition-all active:scale-[.98]"
                style={{ boxShadow: '0 4px 16px rgba(74,114,89,0.28)' }}
              >
                Jetzt Anspruch prüfen
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <span className="flex items-center gap-1.5 text-xs text-v3-on-surface-v">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Dauert nur 2 Minuten
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
