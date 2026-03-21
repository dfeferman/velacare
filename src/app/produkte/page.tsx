'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_PRODUKTE, MOCK_BUDGET_LIMIT } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Produkt } from '@/lib/types'

const KATEGORIEN = ['Alle', 'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene'] as const

export default function ProduktePublicPage() {
  const [auswahl, setAuswahl] = useState<Produkt[]>([])
  const [aktiveKat, setAktiveKat] = useState<string>('Alle')

  const gesamtwert = auswahl.reduce((s, p) => s + p.preis, 0)
  const prozent = Math.min((gesamtwert / MOCK_BUDGET_LIMIT) * 100, 100)

  const gefiltert = aktiveKat === 'Alle'
    ? MOCK_PRODUKTE
    : MOCK_PRODUKTE.filter(p => p.kategorie === aktiveKat)

  const toggle = (p: Produkt) =>
    setAuswahl(prev =>
      prev.some(x => x.id === p.id)
        ? prev.filter(x => x.id !== p.id)
        : [...prev, p]
    )

  return (
    <div className="bg-bg min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-xs text-warm-gray">
          <Link href="/" className="hover:text-terra transition-colors">Startseite</Link>
          <span>›</span>
          <span className="text-dark">Produkte</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-serif text-4xl font-semibold mb-6">Produkte &amp; Box zusammenstellen</h1>

        {/* Budget-Card */}
        <div className="bg-warm-white rounded-xl border border-mid-gray p-5 mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">Budget genutzt</span>
            <span className="text-sm font-semibold text-dark">
              {gesamtwert.toFixed(2).replace('.', ',')} € von {MOCK_BUDGET_LIMIT.toFixed(2).replace('.', ',')} €
            </span>
          </div>
          <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-terra rounded-full transition-all duration-300"
              style={{ width: `${prozent}%` }}
            />
          </div>
          <p className="text-xs text-warm-gray mt-2">
            ℹ️ Alle Produkte werden vollständig von Ihrer Pflegekasse übernommen.
          </p>
        </div>

        {/* Kategorie-Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {KATEGORIEN.map(k => (
            <button
              key={k}
              onClick={() => setAktiveKat(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex-shrink-0 ${
                aktiveKat === k
                  ? 'bg-terra text-white border-terra'
                  : 'bg-warm-white text-warm-gray border-mid-gray hover:border-terra'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Produkt-Liste */}
        <div className="space-y-3">
          {gefiltert.map(p => {
            const ausgewaehlt = auswahl.some(x => x.id === p.id)
            return (
              <div
                key={p.id}
                className={`bg-warm-white rounded-xl border transition-all flex items-center gap-4 p-4 ${
                  ausgewaehlt ? 'border-terra ring-1 ring-terra/20' : 'border-mid-gray'
                }`}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-terra-pale flex items-center justify-center flex-shrink-0 text-2xl">
                  📦
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="sage" className="text-xs">Kostenlos</Badge>
                    <Badge variant="terra" className="text-xs">{p.kategorie}</Badge>
                  </div>
                  <h3 className="font-medium text-sm text-dark">{p.name}</h3>
                  <p className="text-xs text-warm-gray">{p.beschreibung}</p>
                </div>
                {/* Preis + Button */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-terra">0,00 €</span>
                  <button
                    onClick={() => toggle(p)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      ausgewaehlt
                        ? 'bg-terra text-white hover:bg-terra-dark'
                        : 'bg-terra-pale text-terra hover:bg-terra hover:text-white'
                    }`}
                  >
                    {ausgewaehlt ? '✓ Gewählt' : '+ Hinzufügen'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-warm-white border-t border-mid-gray px-6 py-3 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-warm-gray">Ihre Auswahl</p>
            <p className="text-sm font-semibold text-dark">
              {auswahl.length} Produkt{auswahl.length !== 1 ? 'e' : ''} · {gesamtwert.toFixed(2).replace('.', ',')} €
            </p>
          </div>
          <Button variant="primary" disabled={auswahl.length === 0}>
            <Link href="/beantragen">Box beantragen →</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
