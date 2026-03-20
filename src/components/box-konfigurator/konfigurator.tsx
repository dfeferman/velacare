'use client'

import { useState } from 'react'
import type { Produkt, BoxProdukt, ProduktKategorie } from '@/lib/types'
import { MOCK_BUDGET_LIMIT } from '@/lib/mock-data'
import { ProduktKarte } from './produkt-karte'
import { BudgetAnzeige } from './budget-anzeige'
import { Button } from '@/components/ui/button'

const KATEGORIEN: (ProduktKategorie | 'Alle')[] = ['Alle', 'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges']

interface KonfiguratorProps {
  produkte: Produkt[]
  initialBox?: BoxProdukt[]
  onSave: (box: BoxProdukt[]) => void
  saveLabel?: string
}

export function Konfigurator({ produkte, initialBox = [], onSave, saveLabel = 'Box speichern' }: KonfiguratorProps) {
  const [box, setBox] = useState<BoxProdukt[]>(initialBox)
  const [kategorie, setKategorie] = useState<ProduktKategorie | 'Alle'>('Alle')

  const gesamtwert = box.reduce((sum, item) => sum + item.produkt.preis, 0)

  const toggleProdukt = (produkt: Produkt, menge: string | null) => {
    const istDrin = box.some(b => b.produkt.id === produkt.id)
    if (istDrin) {
      if (menge !== null) {
        setBox(prev => prev.map(b => b.produkt.id === produkt.id ? { ...b, menge } : b))
      } else {
        setBox(prev => prev.filter(b => b.produkt.id !== produkt.id))
      }
    } else {
      setBox(prev => [...prev, { produkt, menge }])
    }
  }

  const gefiltert = kategorie === 'Alle' ? produkte : produkte.filter(p => p.kategorie === kategorie)
  const ueberschritten = gesamtwert > MOCK_BUDGET_LIMIT

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-4">
        <BudgetAnzeige genutzt={gesamtwert} />

        <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Kategorie</p>
          <div className="flex flex-wrap gap-1">
            {KATEGORIEN.map(k => (
              <button
                key={k}
                onClick={() => setKategorie(k)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  kategorie === k ? 'bg-terra text-white' : 'bg-bg text-warm-gray hover:bg-terra-pale hover:text-terra'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {box.length > 0 && (
          <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ihre Auswahl</p>
            <div className="space-y-2">
              {box.map(item => (
                <div key={item.produkt.id} className="flex justify-between items-center text-xs">
                  <span className="text-dark">{item.produkt.name}{item.menge ? ` (${item.menge})` : ''}</span>
                  <span className="text-terra font-medium">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={ueberschritten || box.length === 0}
          onClick={() => onSave(box)}
        >
          {saveLabel}
        </Button>
      </div>

      {/* Produkt-Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gefiltert.map(produkt => {
          const boxItem = box.find(b => b.produkt.id === produkt.id)
          const ausgewaehlt = !!boxItem
          const budgetNachHinzufuegen = gesamtwert + (ausgewaehlt ? 0 : produkt.preis)
          return (
            <ProduktKarte
              key={produkt.id}
              produkt={produkt}
              ausgewaehlt={ausgewaehlt}
              gewaehlteMenge={boxItem?.menge ?? null}
              budgetWuerdeUeberschritten={budgetNachHinzufuegen > MOCK_BUDGET_LIMIT}
              onToggle={toggleProdukt}
            />
          )
        })}
      </div>
    </div>
  )
}
