'use client'

import { useState } from 'react'
import { BudgetAnzeige } from '@/components/box-konfigurator/budget-anzeige'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

interface Step1Props {
  produkte: Produkt[]
  onWeiter: (produkte: BoxProdukt[]) => void
}

const KATEGORIEN: ProduktKategorie[] = [
  'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges',
]

export function Step1Produktauswahl({ produkte, onWeiter }: Step1Props) {
  const [gewählt, setGewählt]     = useState<BoxProdukt[]>([])
  const [kategorie, setKategorie] = useState<ProduktKategorie | 'alle'>('alle')

  const verwendetProzent = gewählt.reduce((s, i) => s + i.produkt.maxBudgetProzent, 0)

  const toggle = (produkt: Produkt) => {
    setGewählt(prev => {
      const exists = prev.some(p => p.produkt.id === produkt.id)
      if (exists) return prev.filter(p => p.produkt.id !== produkt.id)
      if (verwendetProzent + produkt.maxBudgetProzent > 100) return prev
      return [...prev, { produkt, menge: null }]
    })
  }

  const gefiltert = kategorie === 'alle'
    ? produkte
    : produkte.filter(p => p.kategorie === kategorie)

  return (
    <div className="animate-fade-up">
      <div className="max-w-5xl mx-auto px-4 py-8 md:flex md:gap-8 md:items-start">

        {/* ── Linke Spalte: Heading + Filter + Produkte ── */}
        <div className="flex-1 min-w-0">

          {/* Heading */}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-v3-on-surface-v mb-3 flex items-center gap-2">
              <span className="eyebrow-dot inline-block w-1.5 h-1.5 rounded-full bg-v3-secondary" aria-hidden="true" />
              Schritt 1 von 3
            </p>
            <div className="deco-rule mb-3" aria-hidden="true" />
            <h1 className="font-newsreader text-3xl text-v3-on-surface mb-2">
              Ihre Pflegehilfsmittel
            </h1>
            <p className="text-v3-on-surface-v text-[15px] leading-relaxed max-w-xl">
              Stellen Sie Ihre persönliche Box zusammen. Alle Produkte sind für Sie
              <strong className="text-v3-primary font-medium"> vollständig kostenlos</strong> — finanziert durch Ihre Pflegekasse.
            </p>
          </div>

          {/* Mobile Budget-Ring (nur < md) */}
          <div
            className="md:hidden mb-6 bg-v3-surface rounded-xl border border-v3-outline/25 p-4"
            role="region"
            aria-label="Pflegekasse-Budget"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={verwendetProzent} size="sm" />
          </div>

          {/* Kategorie-Filter */}
          <div className="flex gap-2 flex-wrap mb-6" role="group" aria-label="Produktkategorie filtern">
            {(['alle', ...KATEGORIEN] as const).map(kat => (
              <button
                key={kat}
                onClick={() => setKategorie(kat)}
                aria-pressed={kategorie === kat}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
                  kategorie === kat
                    ? 'bg-v3-primary text-white shadow-sm shadow-v3-primary/25'
                    : 'bg-v3-primary-pale/70 text-v3-on-surface-v hover:bg-v3-primary-pale hover:text-v3-on-surface',
                ].join(' ')}
              >
                {kat === 'alle' ? 'Alle Produkte' : kat}
              </button>
            ))}
          </div>

          {/* Produkt-Grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {gefiltert.length === 0 && (
              <p className="col-span-2 text-center text-v3-on-surface-v py-8 text-sm">
                Keine Produkte in dieser Kategorie verfügbar.
              </p>
            )}
            {gefiltert.map((produkt, idx) => {
              const selected = gewählt.some(p => p.produkt.id === produkt.id)
              const blocked  = !selected && verwendetProzent + produkt.maxBudgetProzent > 100
              return (
                <button
                  key={produkt.id}
                  onClick={() => toggle(produkt)}
                  disabled={blocked}
                  aria-pressed={selected}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={[
                    'text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group card-lift',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
                    selected
                      ? 'bg-v3-primary-pale border-v3-primary border-2'
                      : blocked
                      ? 'bg-v3-outline/10 border-v3-outline/20 opacity-50 cursor-not-allowed'
                      : 'bg-v3-surface border-v3-outline/30 hover:border-v3-primary/40 hover:bg-v3-primary-pale/30',
                  ].join(' ')}
                >
                  {/* Checkmark */}
                  <div
                    className={[
                      'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                      selected
                        ? 'bg-v3-primary border-v3-primary'
                        : 'border-v3-outline/50 bg-transparent group-hover:border-v3-primary/40',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <p className={['font-medium text-sm pr-7', selected ? 'text-v3-primary' : 'text-v3-on-surface'].join(' ')}>
                    {produkt.name}
                  </p>
                  {produkt.beschreibung && (
                    <p className="text-xs mt-1 text-v3-on-surface-v leading-relaxed">
                      {produkt.beschreibung}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden flex items-center justify-between gap-4">
            <div className="text-sm text-v3-on-surface-v">
              {gewählt.length > 0 ? (
                <span>
                  <span className="font-semibold text-v3-on-surface">{gewählt.length} Produkt{gewählt.length !== 1 ? 'e' : ''}</span>{' '}
                  ausgewählt
                </span>
              ) : (
                <span>Noch keine Produkte ausgewählt</span>
              )}
            </div>
            <button
              onClick={() => onWeiter(gewählt)}
              disabled={gewählt.length === 0}
              className={[
                'ripple-btn min-h-[44px] px-8 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer',
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

        {/* ── Rechte Sidebar: Budget-Ring + Auswahl + CTA (nur Desktop) ── */}
        <aside
          className="hidden md:flex md:flex-col md:w-64 md:shrink-0 sticky top-[132px] gap-4"
          aria-label="Budget und Ihre Auswahl"
        >
          {/* Budget Ring Card */}
          <div className="bg-v3-surface rounded-xl border border-v3-outline/25 p-5 flex flex-col items-center">
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-4 self-start">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={verwendetProzent} size="md" />
          </div>

          {/* Auswahl-Liste */}
          {gewählt.length > 0 && (
            <div className="bg-v3-surface rounded-xl border border-v3-outline/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
                Ihre Auswahl{' '}
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-v3-primary text-white text-[10px] font-bold">
                  {gewählt.length}
                </span>
              </p>
              <ul className="space-y-2">
                {gewählt.map(item => (
                  <li key={item.produkt.id} className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-v3-on-surface leading-relaxed flex-1">{item.produkt.name}</span>
                    <span className="text-v3-primary font-medium tabular-nums shrink-0">
                      {item.produkt.maxBudgetProzent} %
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-v3-outline/20 flex justify-between text-xs">
                <span className="text-v3-on-surface-v">Gesamt</span>
                <span className="font-semibold text-v3-on-surface tabular-nums">
                  {verwendetProzent} %
                </span>
              </div>
            </div>
          )}

          {/* Desktop CTA */}
          <button
            onClick={() => onWeiter(gewählt)}
            disabled={gewählt.length === 0}
            className={[
              'ripple-btn w-full min-h-[44px] px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer',
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

          {/* Vertrauens-Hinweis */}
          <p className="text-center text-[11px] text-v3-on-surface-v/70 leading-relaxed px-1">
            Vollständig kostenlos — finanziert durch Ihre Pflegekasse gemäß §40 SGB XI
          </p>
        </aside>

      </div>
    </div>
  )
}
