'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import type { BoxProdukt } from '@/lib/types'

interface Step4Props {
  box: BoxProdukt[]
  onBestaetigen: (stichtag: number) => void
  onZurueck: () => void
}

export function Step4Bestaetigung({ box, onBestaetigen, onZurueck }: Step4Props) {
  const [stichtag, setStichtag] = useState<number>(15)
  const [dsgvo, setDsgvo] = useState(false)
  const [agb, setAgb] = useState(false)

  const gesamtwert = box.reduce((sum, item) => sum + item.produkt.preis, 0)
  const canSubmit = agb && dsgvo && box.length > 0

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24">
      <div className="pt-8 mb-6">
        <ProgressBar schritt={4} gesamtSchritte={4} label="Bestätigung" />
      </div>

      <div className="text-center mb-10">
        <h1 className="font-serif italic text-3xl md:text-4xl text-dark mb-3">
          Fast geschafft.
        </h1>
        <p className="text-warm-gray text-sm max-w-xl mx-auto">
          Bitte überprüfen Sie Ihre Angaben, bevor Sie den Antrag absenden.
        </p>
      </div>

      {/* 2-column bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Card: Ihre Daten */}
        <div className="bg-warm-white rounded-xl p-6 border border-mid-gray">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif italic text-xl text-terra">Ihre Daten</h2>
            <button
              onClick={onZurueck}
              className="text-sage text-sm font-semibold hover:underline"
            >
              Ändern
            </button>
          </div>
          <ul className="space-y-2 text-sm text-dark">
            <li>Maria Mustermann</li>
            <li>Musterstraße 123</li>
            <li>10115 Berlin</li>
            <li className="text-warm-gray">maria.mustermann@example.de</li>
          </ul>
        </div>

        {/* Card: Ihre Auswahl */}
        <div className="bg-warm-white rounded-xl p-6 border border-mid-gray">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif italic text-xl text-terra">Ihre Auswahl</h2>
            <button
              onClick={onZurueck}
              className="text-sage text-sm font-semibold hover:underline"
            >
              Ändern
            </button>
          </div>
          {box.length === 0 ? (
            <p className="text-warm-gray text-sm">Keine Produkte gewählt.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {box.map(item => (
                <li key={item.produkt.id} className="flex justify-between gap-2">
                  <span className="text-dark">
                    • {item.produkt.name}{item.menge ? ` (${item.menge})` : ''}
                  </span>
                  <span className="text-terra font-medium whitespace-nowrap">
                    {item.produkt.preis.toFixed(2).replace('.', ',')} €
                  </span>
                </li>
              ))}
              <li className="border-t border-mid-gray pt-2 flex justify-between font-semibold">
                <span>Gesamt</span>
                <span className="text-terra">{gesamtwert.toFixed(2).replace('.', ',')} €</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Full-width card: Liefertermin */}
      <div className="bg-warm-white rounded-xl p-6 border border-mid-gray mb-6">
        <h2 className="font-serif italic text-xl text-terra mb-4">Gewünschter Liefertermin</h2>
        <p className="text-warm-gray text-sm mb-4">
          An welchem Tag des Monats soll Ihre Box monatlich geliefert werden?
        </p>
        <select
          value={stichtag}
          onChange={e => setStichtag(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-lg border border-mid-gray bg-bg text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terra/30"
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map(tag => (
            <option key={tag} value={tag}>{tag}. des Monats</option>
          ))}
        </select>
      </div>

      {/* Legal checkboxes */}
      <div className="space-y-4 mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agb}
            onChange={e => setAgb(e.target.checked)}
            className="mt-0.5 accent-terra"
          />
          <span className="text-sm text-warm-gray">
            Ich akzeptiere die{' '}
            <a href="/agb" className="text-terra underline hover:no-underline">
              Allgemeinen Geschäftsbedingungen
            </a>
            .
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={dsgvo}
            onChange={e => setDsgvo(e.target.checked)}
            className="mt-0.5 accent-terra"
          />
          <span className="text-sm text-warm-gray">
            Ich habe die{' '}
            <a href="/datenschutz" className="text-terra underline hover:no-underline">
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme der Verarbeitung meiner Daten zu.
          </span>
        </label>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
        <Button
          variant="primary"
          className="px-8 py-3 text-base"
          disabled={!canSubmit}
          onClick={() => onBestaetigen(stichtag)}
        >
          Jetzt kostenfrei beantragen
        </Button>
      </div>
    </div>
  )
}
