'use client'

import { useState, useEffect } from 'react'
import { BudgetAnzeige } from '@/components/box-konfigurator/budget-anzeige'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

// ── Konstanten ────────────────────────────────────────────────────────────────

const KATEGORIEN_GEORDNET: ProduktKategorie[] = [
  'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges',
]

type KategorieStil = { bg: string; accent: string; badgeBg: string; badgeText: string }

const KATEGORIE_STIL: Record<ProduktKategorie, KategorieStil> = {
  Handschuhe:     { bg: 'bg-[#E3EDE6]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Desinfektion:   { bg: 'bg-[#EFE3D4]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
  Mundschutz:     { bg: 'bg-[#E3EDE6]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Schutzkleidung: { bg: 'bg-[#EFE3D4]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
  Hygiene:        { bg: 'bg-[#E3EDE6]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Sonstiges:      { bg: 'bg-[#EFE3D4]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
}

// ── Hilfsfunktion ─────────────────────────────────────────────────────────────

function boxKey(produkt: Produkt, menge: string | null): string {
  return `${produkt.id}::${menge ?? ''}`
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  anzahl,
  onDecrement,
  onIncrement,
  incrementDisabled,
}: {
  anzahl: number
  onDecrement: () => void
  onIncrement: () => void
  incrementDisabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={anzahl === 0}
        aria-label="Anzahl verringern"
        className={[
          'ripple-btn w-[30px] h-[30px] rounded-full border-[1.5px] flex items-center justify-center',
          'transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
          'border-v3-outline text-v3-on-surface-v',
          'hover:border-v3-primary hover:bg-v3-primary-pale hover:text-v3-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
          <path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <span
        key={anzahl}
        className="count-reveal w-6 text-center text-sm font-semibold tabular-nums text-v3-on-surface"
        aria-live="polite"
        aria-atomic="true"
      >
        {anzahl}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={incrementDisabled}
        aria-label="Anzahl erhöhen"
        className={[
          'ripple-btn w-[30px] h-[30px] rounded-full border-[1.5px] flex items-center justify-center',
          'transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
          'border-v3-outline text-v3-on-surface-v',
          'hover:border-v3-primary hover:bg-v3-primary-pale hover:text-v3-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ── Reguläre Produktkarte ─────────────────────────────────────────────────────

function ProduktKarteNeu({
  produkt,
  box,
  gesamtProzent,
  onSetAnzahl,
  animIdx,
}: {
  produkt: Produkt
  box: BoxProdukt[]
  gesamtProzent: number
  onSetAnzahl: (p: Produkt, m: string | null, delta: number) => void
  animIdx: number
}) {
  const item     = box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, null))
  const anzahl   = item?.anzahl ?? 0
  const selected = anzahl > 0
  const incrementDisabled = gesamtProzent + produkt.maxBudgetProzent > 100

  return (
    <div
      style={{ animationDelay: `${animIdx * 40}ms` }}
      className={[
        'rounded-xl border p-4 transition-all duration-200 card-lift',
        selected
          ? 'bg-v3-primary-pale border-v3-primary border-2 shadow-sm shadow-v3-primary/10'
          : incrementDisabled
          ? 'bg-v3-outline/10 border-v3-outline/20 opacity-50'
          : 'bg-white border-v3-outline/60 shadow-sm shadow-black/[0.08] hover:border-v3-primary/50 hover:bg-v3-primary-pale/30',
      ].join(' ')}
    >
      <p className={['font-medium text-sm mb-1 pr-2', selected ? 'text-v3-primary' : 'text-v3-on-surface'].join(' ')}>
        {produkt.name}
      </p>
      {produkt.beschreibung && (
        <p className="text-xs text-v3-on-surface-v leading-relaxed mb-3">{produkt.beschreibung}</p>
      )}
      <div className="flex justify-end">
        <Stepper
          anzahl={anzahl}
          onDecrement={() => onSetAnzahl(produkt, null, -1)}
          onIncrement={() => onSetAnzahl(produkt, null, +1)}
          incrementDisabled={incrementDisabled}
        />
      </div>
    </div>
  )
}

// ── Handschuh-Karte (Größen + Anzahl) ────────────────────────────────────────

function HandschuhKarte({
  produkt,
  box,
  gesamtProzent,
  onSetAnzahl,
  animIdx,
}: {
  produkt: Produkt
  box: BoxProdukt[]
  gesamtProzent: number
  onSetAnzahl: (p: Produkt, m: string | null, delta: number) => void
  animIdx: number
}) {
  const groessen    = produkt.mengenOptionen ?? []
  const anySelected = groessen.some(g => (box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, g))?.anzahl ?? 0) > 0)

  return (
    <div
      style={{ animationDelay: `${animIdx * 40}ms` }}
      className={[
        'rounded-xl border p-4 transition-all duration-200 card-lift sm:col-span-2',
        anySelected
          ? 'bg-v3-primary-pale border-v3-primary border-2 shadow-sm shadow-v3-primary/10'
          : 'bg-white border-v3-outline/60 shadow-sm shadow-black/[0.08] hover:border-v3-primary/50 hover:bg-v3-primary-pale/30',
      ].join(' ')}
    >
      <p className={['font-medium text-sm mb-1', anySelected ? 'text-v3-primary' : 'text-v3-on-surface'].join(' ')}>
        {produkt.name}
      </p>
      {produkt.beschreibung && (
        <p className="text-xs text-v3-on-surface-v leading-relaxed mb-3">{produkt.beschreibung}</p>
      )}
      <div className="space-y-2.5">
        {groessen.map(groesse => {
          const item    = box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, groesse))
          const anzahl  = item?.anzahl ?? 0
          const incrementDisabled = gesamtProzent + produkt.maxBudgetProzent > 100
          return (
            <div key={groesse} className="flex items-center justify-between gap-3">
              <span className={[
                'text-xs font-medium px-2.5 py-1 rounded border transition-colors',
                anzahl > 0
                  ? 'bg-v3-primary text-white border-v3-primary'
                  : 'border-v3-outline text-v3-on-surface-v bg-transparent',
              ].join(' ')}>
                {groesse}
              </span>
              <Stepper
                anzahl={anzahl}
                onDecrement={() => onSetAnzahl(produkt, groesse, -1)}
                onIncrement={() => onSetAnzahl(produkt, groesse, +1)}
                incrementDisabled={incrementDisabled}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────

interface Step1Props {
  produkte: Produkt[]
  onWeiter: (produkte: BoxProdukt[]) => void
}

export function Step1Produktauswahl({ produkte, onWeiter }: Step1Props) {
  const [box, setBox] = useState<BoxProdukt[]>([])

  const gesamtProzent = box.reduce((sum, item) => sum + item.produkt.maxBudgetProzent * item.anzahl, 0)
  const gesamtArtikel = box.reduce((sum, item) => sum + item.anzahl, 0)

  // Scroll Reveal für Kategoriesektionen
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.kategorie-sektion').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [produkte])

  const setAnzahl = (produkt: Produkt, menge: string | null, delta: number) => {
    const key = boxKey(produkt, menge)
    setBox(prev => {
      const aktuellesProzent = prev.reduce((s, b) => s + b.produkt.maxBudgetProzent * b.anzahl, 0)
      const existing = prev.find(b => boxKey(b.produkt, b.menge) === key)
      if (!existing) {
        if (delta <= 0) return prev
        if (aktuellesProzent + produkt.maxBudgetProzent > 100) return prev
        return [...prev, { produkt, menge, anzahl: 1 }]
      }
      const neueAnzahl = existing.anzahl + delta
      if (neueAnzahl <= 0) return prev.filter(b => boxKey(b.produkt, b.menge) !== key)
      if (delta > 0 && aktuellesProzent + produkt.maxBudgetProzent > 100) return prev
      return prev.map(b => boxKey(b.produkt, b.menge) === key ? { ...b, anzahl: neueAnzahl } : b)
    })
  }

  const removeItem = (produkt: Produkt, menge: string | null) => {
    setBox(prev => prev.filter(b => boxKey(b.produkt, b.menge) !== boxKey(produkt, menge)))
  }

  const gruppen = KATEGORIEN_GEORDNET
    .map(kat => ({ kat, prod: produkte.filter(p => p.kategorie === kat) }))
    .filter(g => g.prod.length > 0)

  return (
    <div className="animate-fade-up">
      <div className="max-w-5xl mx-auto px-4 py-8 md:flex md:gap-8 md:items-start">

        {/* ── Linke Spalte ── */}
        <div className="flex-1 min-w-0">

          {/* Heading */}
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-v3-on-surface-v mb-3 flex items-center gap-2">
              <span className="eyebrow-dot inline-block w-1.5 h-1.5 rounded-full bg-v3-secondary" aria-hidden="true" />
              Schritt 1 von 3
            </p>
            <div className="deco-rule mb-3" aria-hidden="true" />
            <h1 className="font-newsreader text-3xl text-v3-on-surface mb-2">
              Ihre Pflegehilfsmittel
            </h1>
            <p className="text-v3-on-surface-v text-[15px] leading-relaxed max-w-xl">
              Stellen Sie Ihre pers&ouml;nliche Box zusammen. Alle Produkte sind f&uuml;r Sie
              <strong className="text-v3-primary font-medium"> vollst&auml;ndig kostenlos</strong> &mdash; finanziert durch Ihre Pflegekasse.
            </p>
          </div>

          {/* Mobile Budget-Ring */}
          <div
            className="md:hidden mb-6 bg-white rounded-xl border border-v3-outline/60 shadow-sm shadow-black/[0.08] p-4"
            role="region"
            aria-label="Pflegekasse-Budget"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={gesamtProzent} size="sm" />
          </div>

          {/* Kategoriesektionen */}
          {gruppen.map(({ kat, prod }) => {
            const stil = KATEGORIE_STIL[kat]
            return (
              <section
                key={kat}
                className={`kategorie-sektion reveal rounded-2xl p-5 mb-5 border border-black/[0.07] shadow-sm shadow-black/[0.06] ${stil.bg}`}
                aria-label={kat}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full ${stil.accent} shrink-0`} aria-hidden="true" />
                  <h2 className="font-newsreader text-xl text-v3-on-surface">{kat}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stil.badgeBg} ${stil.badgeText}`}>
                    {prod.length} Produkt{prod.length !== 1 ? 'e' : ''}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {prod.map((produkt, idx) =>
                    produkt.mengenOptionen && produkt.mengenOptionen.length > 0 ? (
                      <HandschuhKarte
                        key={produkt.id}
                        produkt={produkt}
                        box={box}
                        gesamtProzent={gesamtProzent}
                        onSetAnzahl={setAnzahl}
                        animIdx={idx}
                      />
                    ) : (
                      <ProduktKarteNeu
                        key={produkt.id}
                        produkt={produkt}
                        box={box}
                        gesamtProzent={gesamtProzent}
                        onSetAnzahl={setAnzahl}
                        animIdx={idx}
                      />
                    )
                  )}
                </div>
              </section>
            )
          })}

          {/* Mobile CTA */}
          <div className="md:hidden mt-4 flex flex-col gap-3">
            {box.length > 0 && (
              <p className="text-sm text-v3-on-surface-v text-center">
                <span className="font-semibold text-v3-on-surface">{box.length} Produkt{box.length !== 1 ? 'e' : ''}</span>
                {', '}
                <span className="font-semibold text-v3-on-surface">{gesamtArtikel} Artikel</span> ausgew&auml;hlt
              </p>
            )}
            <button
              type="button"
              onClick={() => onWeiter(box)}
              disabled={box.length === 0}
              className={[
                'ripple-btn w-full min-h-[44px] px-6 py-3 rounded-xl font-medium text-sm',
                'transition-all duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark',
                'shadow-sm shadow-v3-primary/20',
              ].join(' ')}
            >
              Weiter
              <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Rechte Sidebar ── */}
        <aside
          className="hidden md:flex md:flex-col md:w-64 md:shrink-0 sticky top-[132px] gap-4"
          aria-label="Budget und Ihre Auswahl"
        >
          <div className="bg-white rounded-xl border border-v3-outline/60 shadow-sm shadow-black/[0.08] p-5 flex flex-col items-center">
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-4 self-start">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={gesamtProzent} size="md" />
          </div>

          {box.length > 0 && (
            <div className="bg-white rounded-xl border border-v3-outline/60 shadow-sm shadow-black/[0.08] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
                Ihre Auswahl{' '}
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-v3-primary text-white text-[10px] font-bold">
                  {box.length}
                </span>
              </p>
              <ul className="space-y-2" role="list">
                {box.map(item => (
                  <li
                    key={boxKey(item.produkt, item.menge)}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-v3-on-surface leading-relaxed flex-1">
                      {item.produkt.name}{item.menge ? ` ${item.menge}` : ''}
                    </span>
                    <span className="text-v3-on-surface font-medium tabular-nums shrink-0">
                      &times;&nbsp;{item.anzahl}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.produkt, item.menge)}
                      aria-label={`${item.produkt.name}${item.menge ? ` ${item.menge}` : ''} entfernen`}
                      className="text-v3-on-surface-v hover:text-v3-secondary transition-colors shrink-0 cursor-pointer p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-v3-outline/20 text-xs text-v3-on-surface-v">
                {gesamtArtikel} Artikel gesamt
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onWeiter(box)}
            disabled={box.length === 0}
            className={[
              'ripple-btn w-full min-h-[44px] px-6 py-3 rounded-xl font-medium text-sm',
              'transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark',
              'shadow-sm shadow-v3-primary/20',
            ].join(' ')}
          >
            Weiter zu Ihren Daten
            <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="text-center text-[11px] text-v3-on-surface-v/70 leading-relaxed px-1">
            Vollst&auml;ndig kostenlos &mdash; finanziert durch Ihre Pflegekasse gem&auml;&szlig; &sect;40 SGB XI
          </p>
        </aside>

      </div>
    </div>
  )
}
