'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { MOCK_PRODUKTE, MOCK_BUDGET_LIMIT } from '@/lib/mock-data'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

interface Step3Props {
  onWeiter: (box: BoxProdukt[]) => void
  onZurueck: () => void
}

const KATEGORIEN: ProduktKategorie[] = ['Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges']

export function Step3Box({ onWeiter, onZurueck }: Step3Props) {
  const [gewählt, setGewählt] = useState<BoxProdukt[]>([])
  const [aktivKategorie, setAktivKategorie] = useState<string>('alle')

  const verwendetBetrag = gewählt.reduce((sum, item) => sum + item.produkt.preis, 0)
  const budgetProzent = Math.min((verwendetBetrag / MOCK_BUDGET_LIMIT) * 100, 100)

  const toggle = (produkt: Produkt) => {
    setGewählt(prev => {
      const exists = prev.some(p => p.produkt.id === produkt.id)
      if (exists) return prev.filter(p => p.produkt.id !== produkt.id)
      return [...prev, { produkt, menge: null }]
    })
  }

  const gefilterteProdukete = aktivKategorie === 'alle'
    ? MOCK_PRODUKTE
    : MOCK_PRODUKTE.filter(p => p.kategorie === aktivKategorie)

  return (
    <div className="max-w-5xl mx-auto px-6 pb-40">
      <div className="pt-8 mb-6">
        <ProgressBar schritt={3} gesamtSchritte={4} label="Box konfigurieren" />
      </div>

      <div className="text-center mb-8">
        <h1 className="font-serif italic text-3xl md:text-4xl text-dark mb-3">
          Wähle deine Pflegehilfsmittel
        </h1>
        <p className="text-warm-gray text-sm max-w-xl mx-auto">
          Stellen Sie Ihre persönliche Box zusammen. Ihr monatliches Budget von{' '}
          <span className="text-terra font-semibold">{MOCK_BUDGET_LIMIT.toFixed(2).replace('.', ',')} €</span>{' '}
          wird von der Pflegekasse übernommen.
        </p>
      </div>

      {/* Sticky budget + filter section */}
      <div className="sticky top-14 z-40 bg-bg/95 backdrop-blur py-4 space-y-4">
        {/* Budget card */}
        <div className="bg-warm-white rounded-xl p-4 border border-mid-gray">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-dark">Budget</span>
            <span className="text-sm font-semibold text-terra">
              {verwendetBetrag.toFixed(2).replace('.', ',')} € / {MOCK_BUDGET_LIMIT.toFixed(2).replace('.', ',')} €
            </span>
          </div>
          <div className="w-full h-3 bg-mid-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-terra rounded-full transition-all duration-300"
              style={{ width: `${budgetProzent}%` }}
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAktivKategorie('alle')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              aktivKategorie === 'alle'
                ? 'bg-terra text-white'
                : 'bg-mid-gray text-warm-gray hover:text-dark'
            }`}
          >
            Alle Produkte
          </button>
          {KATEGORIEN.map(kategorie => (
            <button
              key={kategorie}
              onClick={() => setAktivKategorie(kategorie)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                aktivKategorie === kategorie
                  ? 'bg-terra text-white'
                  : 'bg-mid-gray text-warm-gray hover:text-dark'
              }`}
            >
              {kategorie}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {gefilterteProdukete.map(produkt => {
          const isSelected = gewählt.some(p => p.produkt.id === produkt.id)
          return (
            <div
              key={produkt.id}
              className={`bg-warm-white rounded-xl p-5 border transition-all ${
                isSelected
                  ? 'border-sage/40 shadow-sm'
                  : 'border-mid-gray hover:border-terra/30 hover:shadow'
              }`}
            >
              {/* Image placeholder */}
              <div className="aspect-square bg-bg rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl text-warm-gray/40">📦</span>
              </div>

              {/* Product info */}
              <h3 className="font-serif italic text-lg text-dark mb-1 leading-snug">
                {produkt.name}
              </h3>
              <p className="text-warm-gray text-sm mb-3 line-clamp-2">
                {produkt.beschreibung}
              </p>
              <p className="text-terra font-semibold mb-4">
                {produkt.preis.toFixed(2).replace('.', ',')} €
              </p>

              {/* Toggle button */}
              <button
                onClick={() => toggle(produkt)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-sage text-white hover:bg-sage/90'
                    : 'bg-terra text-white hover:bg-terra/90'
                }`}
              >
                {isSelected ? '✓ Gewählt' : 'Hinzufügen'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-t border-mid-gray shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 pb-6 flex items-center justify-between gap-4">
          {/* Left: selection info */}
          <div>
            <p className="text-xs text-warm-gray font-medium">Deine Auswahl</p>
            <p className="text-sm font-semibold text-dark">
              {gewählt.length > 0 ? `${gewählt.length} Produkt${gewählt.length !== 1 ? 'e' : ''} gewählt` : 'Keine Produkte'}
            </p>
          </div>

          {/* Center: total */}
          <div className="text-center hidden sm:block">
            <p className="text-sm font-semibold text-terra">
              {verwendetBetrag.toFixed(2).replace('.', ',')} € / {MOCK_BUDGET_LIMIT.toFixed(2).replace('.', ',')} €
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex gap-3 items-center">
            <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
            <Button
              variant="primary"
              disabled={gewählt.length === 0}
              onClick={() => onWeiter(gewählt)}
            >
              Weiter →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
