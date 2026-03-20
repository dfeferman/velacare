'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Pflegegrad } from '@/lib/types'

interface Step1Props {
  onWeiter: (data: { pflegegrad: Pflegegrad; zuhause: boolean; gesetzlichVersichert: boolean }) => void
}

export function Step1Anspruch({ onWeiter }: Step1Props) {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad | null>(null)
  const [zuhause, setZuhause] = useState<boolean | null>(null)
  const [gesetzlich, setGesetzlich] = useState<boolean | null>(null)

  const hatAnspruch = pflegegrad !== null && zuhause === true && gesetzlich === true
  const keinAnspruch = (zuhause === false || gesetzlich === false)

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Pflegegrad</p>
        <div className="flex gap-2 flex-wrap">
          {([1, 2, 3, 4, 5] as Pflegegrad[]).map(pg => (
            <button
              key={pg}
              onClick={() => setPflegegrad(pg)}
              className={`w-14 h-14 rounded-lg border-2 font-serif text-xl font-semibold transition-all ${
                pflegegrad === pg ? 'border-terra bg-terra text-white' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {pg}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Pflegeort</p>
        <div className="flex gap-3">
          {[{ val: true, label: 'Zuhause (häusliche Pflege)' }, { val: false, label: 'Pflegeheim / stationär' }].map(o => (
            <button
              key={String(o.val)}
              onClick={() => setZuhause(o.val)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                zuhause === o.val ? 'border-terra bg-terra-pale text-terra' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Krankenversicherung</p>
        <div className="flex gap-3">
          {[{ val: true, label: 'Gesetzlich versichert' }, { val: false, label: 'Privat versichert' }].map(o => (
            <button
              key={String(o.val)}
              onClick={() => setGesetzlich(o.val)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                gesetzlich === o.val ? 'border-terra bg-terra-pale text-terra' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {hatAnspruch && (
        <div className="bg-sage-pale border border-sage-light rounded-lg p-4">
          <p className="text-sage font-medium text-sm">✓ Sie haben Anspruch auf bis zu 42 € monatlich!</p>
          <p className="text-sage/70 text-xs mt-1">Ihre Pflegekasse übernimmt die Kosten vollständig.</p>
        </div>
      )}

      {keinAnspruch && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">Leider kein Anspruch in Ihrer Situation.</p>
          <p className="text-amber/70 text-xs mt-1">Die Pflegehilfsmittel gemäß § 40 SGB XI sind nur für häusliche Pflege mit gesetzlicher Krankenversicherung.</p>
        </div>
      )}

      <Button
        variant="primary"
        disabled={!hatAnspruch}
        onClick={() => hatAnspruch && onWeiter({ pflegegrad: pflegegrad!, zuhause: true, gesetzlichVersichert: true })}
        className="w-full"
      >
        Weiter →
      </Button>
    </div>
  )
}
