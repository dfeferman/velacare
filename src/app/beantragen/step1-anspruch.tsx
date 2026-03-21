'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { Pflegegrad } from '@/lib/types'

interface Step1Props {
  onWeiter: (data: { pflegegrad: Pflegegrad; zuhause: boolean }) => void
}

export function Step1Anspruch({ onWeiter }: Step1Props) {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad | null>(null)
  const [zuhause, setZuhause] = useState<boolean | null>(null)

  const hatAnspruch = pflegegrad !== null && zuhause === true

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Progress */}
      <ProgressBar schritt={1} gesamtSchritte={4} label="Anspruch prüfen" />

      <div className="mt-8 grid md:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Hauptinhalt */}
        <div>
          {/* Info-Card */}
          <div className="bg-sage-pale border border-sage-light rounded-xl p-4 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center flex-shrink-0 text-sm">✓</div>
            <div>
              <p className="text-sm font-semibold text-sage">Sofort-Ergebnis</p>
              <p className="text-xs text-sage/70">Sie haben Anspruch auf bis zu 42 €/Monat — wir prüfen es sofort.</p>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-semibold text-dark mb-8">Prüfen Sie Ihren Anspruch</h1>

          {/* Pflegegrad */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-dark mb-3">Welchen Pflegegrad haben Sie?</p>
            <div className="flex gap-3">
              {([1, 2, 3, 4, 5] as Pflegegrad[]).map(pg => (
                <button
                  key={pg}
                  onClick={() => setPflegegrad(pg)}
                  className={`w-14 h-14 rounded-xl border-2 font-serif text-xl font-semibold transition-all ${
                    pflegegrad === pg
                      ? 'border-terra bg-terra text-white shadow-md'
                      : 'border-mid-gray text-dark bg-warm-white hover:border-terra'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          </div>

          {/* Pflegeort */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-dark mb-3">Wo erfolgt die Pflege?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setZuhause(true)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  zuhause === true
                    ? 'border-terra bg-terra-pale'
                    : 'border-mid-gray bg-warm-white hover:border-terra'
                }`}
              >
                <p className="font-semibold text-sm text-dark">Zuhause</p>
                <p className="text-xs text-warm-gray mt-1">Häusliche Pflege</p>
              </button>
              <button
                disabled
                className="p-4 rounded-xl border-2 border-mid-gray bg-bg text-left opacity-40 cursor-not-allowed"
              >
                <p className="font-semibold text-sm text-dark">Pflegeheim</p>
                <p className="text-xs text-warm-gray mt-1">Stationäre Pflege</p>
              </button>
            </div>
          </div>

          {/* Ergebnis */}
          {hatAnspruch && (
            <div className="bg-sage-pale border border-sage-light rounded-xl p-4 mb-6">
              <p className="text-sage font-semibold text-sm">✓ Sie haben Anspruch auf bis zu 42 € monatlich!</p>
              <p className="text-sage/70 text-xs mt-1">Pflegekasse übernimmt die Kosten vollständig nach § 40 SGB XI.</p>
            </div>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            disabled={!hatAnspruch}
            onClick={() => hatAnspruch && onWeiter({ pflegegrad: pflegegrad!, zuhause: true })}
            className="w-full py-3 text-base"
          >
            Weiter →
          </Button>
          <p className="text-xs text-warm-gray text-center mt-3">
            Ihre Daten sind sicher. Wir speichern nichts ohne Ihre Zustimmung.
          </p>
        </div>

        {/* Sidebar: Was Sie erwartet */}
        <div className="bg-warm-white rounded-xl border border-mid-gray p-5 md:sticky md:top-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Was Sie erwartet</p>
          <ul className="space-y-3">
            {[
              'Einmalhandschuhe',
              'Händedesinfektion',
              'Pflegebetteinlagen',
              'Mundschutz FFP2',
              'Kostenlose Lieferung',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-dark">
                <span className="w-5 h-5 rounded-full bg-terra-pale flex items-center justify-center text-terra text-xs flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-mid-gray">
            <p className="text-xs text-warm-gray">Ihr monatliches Budget:</p>
            <p className="font-serif text-2xl font-semibold text-terra">42,00 €</p>
            <p className="text-xs text-warm-gray">vollständig von der Pflegekasse</p>
          </div>
        </div>
      </div>
    </div>
  )
}
