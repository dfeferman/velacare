'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Data ─────────────────────────────────────────────────────────────────────

const SCHRITTE = [
  {
    num: 1,
    title: 'Angaben machen',
    desc: 'Füllen Sie unser Online-Formular aus. Pflegegrad und Adresse eingeben — dauert weniger als 2 Minuten. Kein Papierkram nötig.',
    badge: 'Vollständig online',
  },
  {
    num: 2,
    title: 'Antrag prüfen',
    desc: 'Velacare regelt alle Formalitäten direkt mit Ihrer Pflegekasse. Wir kümmern uns um die Genehmigung, damit Sie entlastet werden.',
    badge: 'Wir übernehmen den Schriftverkehr',
  },
  {
    num: 3,
    title: 'Box zusammenstellen',
    desc: 'Wählen Sie individuell die Hilfsmittel aus, die Sie wirklich benötigen — von Handschuhen über Desinfektion bis hin zu Bettschutzeinlagen.',
    badge: 'Flexibel anpassbar',
  },
  {
    num: 4,
    title: 'Monatliche Lieferung',
    desc: 'Ihre Pflegebox kommt jeden Monat diskret, versandkostenfrei und gratis direkt zu Ihnen nach Hause.',
    badge: 'Vollautomatisch jeden Monat',
    isLast: true,
  },
]

const VORAUSSETZUNGEN = [
  {
    title: 'Pflegegrad 1–5',
    desc: 'Ein anerkannter Pflegegrad ist die gesetzliche Basis für die monatliche Kostenübernahme durch die Pflegekasse.',
    badge: 'Alle Grade berechtigt',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-v3-primary">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
      </svg>
    ),
  },
  {
    title: 'Häusliche Pflege',
    desc: 'Die pflegebedürftige Person wird im eigenen Zuhause, in einer WG oder bei Angehörigen versorgt.',
    badge: 'Ambulante Pflege eingeschlossen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-v3-primary">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
      </svg>
    ),
  },
  {
    title: 'Alle Kassen',
    desc: 'Der gesetzliche Anspruch gilt unabhängig davon, ob Sie gesetzlich oder privat versichert sind.',
    badge: 'GKV und PKV',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-v3-primary">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/>
      </svg>
    ),
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function WieEsFunktioniertPage() {
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([])
  const step4Ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Scroll reveal
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            revealObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el))

    // Timeline connector draw
    connectorRefs.current.forEach((connector) => {
      if (!connector) return
      const stepRow = connector.closest('.step-row') as HTMLElement | null
      if (!stepRow) return
      const lineObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setTimeout(() => connector.classList.add('drawn'), 480)
              lineObs.unobserve(e.target)
            }
          })
        },
        { threshold: 0.55 }
      )
      lineObs.observe(stepRow)
    })

    // Animated checkmark on step 4
    if (step4Ref.current) {
      const checkObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('check-done')
              checkObs.unobserve(e.target)
            }
          })
        },
        { threshold: 0.6 }
      )
      checkObs.observe(step4Ref.current)
    }

    return () => revealObs.disconnect()
  }, [])

  return (
    <div className="bg-v3-background font-sans text-v3-on-surface">

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav className="max-w-7xl mx-auto px-6 py-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-v3-on-surface-v">
          <Link href="/" className="hover:text-v3-primary transition-colors">Startseite</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="text-v3-on-surface font-semibold">Wie es funktioniert</span>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div
          className="bg-v3-surface rounded-2xl px-8 md:px-14 py-12 relative overflow-hidden"
          style={{
            border: '1px solid rgba(213,202,185,0.2)',
            boxShadow: '0 2px 12px rgba(38,30,23,0.05)',
          }}
        >
          {/* Ambient radial gradients */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(at 80% 20%, rgba(74,114,89,0.05) 0, transparent 55%), radial-gradient(at 20% 80%, rgba(158,90,53,0.04) 0, transparent 50%)',
            }}
          />
          <div className="relative max-w-2xl">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-v3-primary mb-5 animate-fade-up"
              style={{
                animationDelay: '0.15s',
                border: '1px solid rgba(74,114,89,0.25)',
                background: '#EEF4F1',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-v3-primary flex-shrink-0 eyebrow-dot" />
              Transparent &amp; menschlich · Digital
            </div>

            <h1
              className="font-newsreader text-4xl md:text-5xl font-semibold text-v3-on-surface leading-[1.08] tracking-tight mb-3 animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              In 4 einfachen{' '}
              <em className="text-v3-primary not-italic">Schritten</em>
              <br className="hidden sm:block" />
              {' '}zu Ihrer Pflegebox
            </h1>

            <div className="deco-rule my-4 animate-fade-up" style={{ animationDelay: '0.24s' }} />

            <p
              className="text-base md:text-lg font-light text-v3-on-surface-v leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: '0.28s' }}
            >
              Wir unterstützen Sie dabei, die Ihnen zustehenden Pflegehilfsmittel unkompliziert und kostenfrei zu erhalten.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline + Visual ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Vertical Timeline */}
          <div>
            <h2 className="font-newsreader text-2xl font-semibold text-v3-on-surface mb-8 reveal">
              So einfach geht's
            </h2>

            {SCHRITTE.map((schritt, i) => (
              <div
                key={schritt.num}
                className={`flex gap-6 reveal reveal-d${i + 1} step-row`}
              >
                {/* Circle + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {schritt.isLast ? (
                    /* Step 4 — animated checkmark */
                    <div
                      ref={step4Ref}
                      className="w-11 h-11 flex-shrink-0 z-10 step-circle-v3"
                      style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                    >
                      <svg viewBox="0 0 44 44" width="44" height="44" fill="none">
                        <circle
                          cx="22" cy="22" r="20" fill="#4A7259"
                          style={{ filter: 'drop-shadow(0 4px 8px rgba(74,114,89,0.3))' }}
                        />
                        <polyline
                          className="check-path"
                          points="13,23 19,29 31,16"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full bg-v3-primary text-white flex items-center justify-center font-newsreader text-lg font-bold z-10 step-circle-v3"
                      style={{
                        animationDelay: `${0.2 + i * 0.15}s`,
                        boxShadow: '0 4px 12px rgba(74,114,89,0.3)',
                      }}
                    >
                      {schritt.num}
                    </div>
                  )}
                  {/* Connector line (not on last step) */}
                  {i < SCHRITTE.length - 1 && (
                    <div
                      ref={(el) => { connectorRefs.current[i] = el }}
                      className="connector flex-1 mt-2"
                      style={{ minHeight: '64px' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1.5 pb-10">
                  <h3 className="font-newsreader text-xl font-semibold text-v3-on-surface mb-2">
                    {schritt.title}
                  </h3>
                  <p className="text-v3-on-surface-v text-sm leading-relaxed">
                    {schritt.desc}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] text-v3-primary font-medium">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {schritt.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Sticky column */}
          <div className="lg:sticky lg:top-28 space-y-5 reveal">
            {/* Visual card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(213,202,185,0.2)',
                boxShadow: '0 8px 32px rgba(38,30,23,0.10), 0 2px 8px rgba(38,30,23,0.05)',
              }}
            >
              {/* Branded box illustration */}
              <div
                className="aspect-[4/3] flex flex-col items-center justify-center gap-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #EEF4F1 0%, #F5EDE5 100%)' }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 60% 40%, rgba(74,114,89,0.07) 0, transparent 60%)' }}
                />
                {/* Box icon */}
                <div
                  className="relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,253,247,0.9)',
                    boxShadow: '0 8px 24px rgba(74,114,89,0.15)',
                    border: '1px solid rgba(213,202,185,0.3)',
                  }}
                >
                  <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
                    <path d="M8 20L32 10L56 20V44L32 54L8 44V20Z" fill="#EEF4F1" stroke="#4A7259" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M8 20L32 30L56 20" stroke="#4A7259" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M32 30V54" stroke="#4A7259" strokeWidth="2"/>
                    <path d="M20 15L44 25" stroke="#5E8C6E" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
                <div className="relative z-10 text-center">
                  <p className="font-newsreader text-lg font-semibold text-v3-on-surface">Ihre Pflegebox</p>
                  <p className="text-xs text-v3-on-surface-v mt-1">Monatlich · Kostenlos · Pünktlich</p>
                </div>
              </div>
            </div>

            {/* Trust card */}
            <div
              className="bg-v3-primary-pale rounded-xl p-5 flex items-start gap-4"
              style={{
                border: '1px solid rgba(74,114,89,0.2)',
                boxShadow: '0 1px 4px rgba(74,114,89,0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(74,114,89,0.15)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="1.8" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-v3-on-surface mb-1">Alles unter Kontrolle</p>
                <p className="text-xs text-v3-on-surface-v leading-relaxed">
                  Wir übernehmen den gesamten Schriftverkehr mit der Kasse für Sie — transparent und ohne Überraschungen.
                </p>
              </div>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-v3-surface rounded-xl p-4 text-center"
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  boxShadow: '0 1px 4px rgba(38,30,23,0.04)',
                }}
              >
                <div className="font-newsreader text-2xl font-bold text-v3-primary mb-0.5">42 €</div>
                <div className="text-[10px] text-v3-on-surface-v font-medium uppercase tracking-wide">Monatlich gratis</div>
              </div>
              <div
                className="bg-v3-surface rounded-xl p-4 text-center"
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  boxShadow: '0 1px 4px rgba(38,30,23,0.04)',
                }}
              >
                <div className="font-newsreader text-2xl font-bold text-v3-primary mb-0.5">2 Min.</div>
                <div className="text-[10px] text-v3-on-surface-v font-medium uppercase tracking-wide">Beantragung</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Voraussetzungen ──────────────────────────────────────────── */}
      <section
        className="bg-v3-surface py-24"
        style={{ borderTop: '1px solid rgba(213,202,185,0.15)', borderBottom: '1px solid rgba(213,202,185,0.15)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest mb-3 text-v3-primary"
              style={{ background: 'rgba(74,114,89,0.1)' }}
            >
              Qualifikation
            </span>
            <h2 className="font-newsreader text-3xl md:text-4xl font-semibold text-v3-on-surface mb-4">
              Wer hat Anspruch?
            </h2>
            <div className="flex justify-center mb-4">
              <div className="deco-rule" />
            </div>
            <p className="text-v3-on-surface-v max-w-lg mx-auto text-sm leading-relaxed">
              Prüfen Sie hier, ob Sie oder Ihr Angehöriger die Kriterien für die kostenfreie Versorgung erfüllen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VORAUSSETZUNGEN.map((v, i) => (
              <div
                key={v.title}
                className={`bg-v3-background rounded-2xl p-8 card-lift reveal reveal-d${i + 1}`}
                style={{
                  border: '1px solid rgba(213,202,185,0.2)',
                  borderTop: '3px solid #4A7259',
                  boxShadow: '0 1px 6px rgba(38,30,23,0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(74,114,89,0.1)' }}
                >
                  {v.icon}
                </div>
                <h3 className="font-newsreader text-xl font-semibold text-v3-on-surface mb-3">{v.title}</h3>
                <p className="text-v3-on-surface-v text-sm leading-relaxed">{v.desc}</p>
                <div
                  className="mt-6 pt-5 flex items-center gap-2 text-[11px] text-v3-primary font-medium"
                  style={{ borderTop: '1px solid rgba(213,202,185,0.15)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {v.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div
          className="rounded-3xl px-10 md:px-20 py-16 text-center relative overflow-hidden reveal"
          style={{
            background: '#EEF4F1',
            border: '1px solid rgba(74,114,89,0.2)',
            boxShadow: '0 4px 24px rgba(74,114,89,0.10)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(74,114,89,0.08) 0, transparent 70%)',
            }}
          />
          <div className="relative">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 text-v3-primary"
              style={{ border: '1px solid rgba(74,114,89,0.25)', background: 'rgba(74,114,89,0.1)' }}
            >
              Jetzt starten
            </span>
            <h2 className="font-newsreader text-3xl md:text-4xl font-semibold text-v3-on-surface leading-[1.1] mb-4">
              Bereit für Ihre erste Box?
            </h2>
            <p className="text-v3-on-surface-v text-sm md:text-base font-light leading-relaxed mb-8 max-w-xl mx-auto">
              In wenigen Klicks prüfen wir Ihren Anspruch und übernehmen den Rest. Kostenlos, unverbindlich und ohne Vertragsbindung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/beantragen"
                className="ripple-btn inline-flex items-center gap-2.5 bg-v3-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-v3-primary-mid transition-all active:scale-[.98]"
                style={{ boxShadow: '0 4px 16px rgba(74,114,89,0.28)' }}
              >
                Jetzt Anspruch prüfen
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
              <span className="text-xs text-v3-on-surface-v flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Dauert nur 2 Minuten
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
