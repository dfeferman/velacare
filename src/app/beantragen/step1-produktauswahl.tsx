'use client'

import { useState } from 'react'
import { BUDGET_LIMIT_EUR } from '@/lib/dal/produkte'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

interface Step1Props {
  produkte: Produkt[]
  onWeiter: (produkte: BoxProdukt[]) => void
}

const KATEGORIEN: ProduktKategorie[] = [
  'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges',
]

export function Step1Produktauswahl({ produkte, onWeiter }: Step1Props) {
  const [gewählt, setGewählt]   = useState<BoxProdukt[]>([])
  const [kategorie, setKategorie] = useState<ProduktKategorie | 'alle'>('alle')

  const verwendetBetrag = gewählt.reduce((s, i) => s + Number(i.produkt.preis), 0)
  const budgetProzent   = Math.min((verwendetBetrag / BUDGET_LIMIT_EUR) * 100, 100)
  const restBudget      = BUDGET_LIMIT_EUR - verwendetBetrag

  const toggle = (produkt: Produkt) => {
    setGewählt(prev => {
      const exists = prev.some(p => p.produkt.id === produkt.id)
      if (exists) return prev.filter(p => p.produkt.id !== produkt.id)
      if (verwendetBetrag + Number(produkt.preis) > BUDGET_LIMIT_EUR) return prev
      return [...prev, { produkt, menge: null }]
    })
  }

  const gefiltert = kategorie === 'alle'
    ? produkte
    : produkte.filter(p => p.kategorie === kategorie)

  return (
    <div className="min-h-screen bg-v2-surface font-manrope">
      {/* Sticky budget bar */}
      <div className="sticky top-0 z-10 bg-v2-surface-lowest border-b border-v2-outline-v">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-v2-surface-mid rounded-full overflow-hidden">
              <div
                className="h-full bg-v2-primary rounded-full transition-all"
                style={{ width: `${budgetProzent}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-v2-on-surface-v whitespace-nowrap">
            {restBudget.toFixed(2).replace('.', ',')} € verfügbar
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl text-v2-on-surface mb-2">
            Ihre Pflegehilfsmittel
          </h1>
          <p className="text-v2-on-surface-v">
            Stellen Sie Ihre persönliche Box zusammen. Alle Produkte sind für Sie kostenlos.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(['alle', ...KATEGORIEN] as const).map(kat => (
            <button
              key={kat}
              onClick={() => setKategorie(kat)}
              className={[
                'px-4 py-1.5 rounded-full text-sm transition-colors',
                kategorie === kat
                  ? 'bg-v2-primary text-white'
                  : 'bg-v2-surface-mid text-v2-on-surface-v hover:bg-v2-surface-low',
              ].join(' ')}
            >
              {kat === 'alle' ? 'Alle' : kat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {gefiltert.map(produkt => {
            const selected  = gewählt.some(p => p.produkt.id === produkt.id)
            const blocked   = !selected && verwendetBetrag + Number(produkt.preis) > BUDGET_LIMIT_EUR
            return (
              <button
                key={produkt.id}
                onClick={() => toggle(produkt)}
                disabled={blocked}
                className={[
                  'text-left p-4 rounded-xl transition-all',
                  selected
                    ? 'bg-v2-primary text-white ring-2 ring-v2-primary'
                    : blocked
                    ? 'bg-v2-surface-mid text-v2-on-surface-v opacity-50 cursor-not-allowed'
                    : 'bg-v2-surface-lowest text-v2-on-surface hover:ring-2 hover:ring-v2-primary/40',
                ].join(' ')}
              >
                <p className="font-medium text-sm">{produkt.name}</p>
                <p className={['text-xs mt-1', selected ? 'text-white/80' : 'text-v2-on-surface-v'].join(' ')}>
                  {produkt.beschreibung}
                </p>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <button
            onClick={() => onWeiter(gewählt)}
            disabled={gewählt.length === 0}
            className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-v2-secondary transition-colors"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
