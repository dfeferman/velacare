'use client'

import { useState } from 'react'
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

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ihre Box</p>
        <div className="space-y-2">
          {box.map(item => (
            <div key={item.produkt.id} className="flex justify-between text-sm">
              <span>{item.produkt.name}{item.menge ? ` (${item.menge})` : ''}</span>
              <span className="text-terra font-medium">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
            </div>
          ))}
          <div className="border-t border-mid-gray pt-2 flex justify-between font-medium">
            <span>Gesamt</span>
            <span className="text-terra">{gesamtwert.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Wunsch-Lieferstichtag</p>
        <select
          value={stichtag}
          onChange={e => setStichtag(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-md border border-mid-gray bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-terra/30"
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map(tag => (
            <option key={tag} value={tag}>{tag}. des Monats</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {[
          { state: dsgvo, set: setDsgvo, label: 'Ich stimme der Datenschutzerklärung zu.' },
          { state: agb, set: setAgb, label: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.' },
        ].map(({ state, set, label }) => (
          <label key={label} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state}
              onChange={e => set(e.target.checked)}
              className="mt-0.5 accent-terra"
            />
            <span className="text-sm text-warm-gray">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!dsgvo || !agb || box.length === 0}
          onClick={() => onBestaetigen(stichtag)}
        >
          Antrag absenden
        </Button>
      </div>
    </div>
  )
}
