'use client'

import { useState } from 'react'

const MONATSBETRAG = 42

export function PflegekasseRechner() {
  const [pflegegrad, setPflegegrad] = useState<number>(2)
  const [zeitraum, setZeitraum] = useState<'monat' | 'jahr'>('jahr')

  const betrag = zeitraum === 'monat' ? MONATSBETRAG : MONATSBETRAG * 12
  const einheit = zeitraum === 'monat' ? 'monatlich' : 'jährlich'

  return (
    <section className="bg-dark py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs tracking-[0.2em] uppercase text-terra-light text-center mb-3">Ihr entgangenes Geld</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white text-center mb-12">
          Wie viel haben Sie bereits verpasst?
        </h2>

        <div className="bg-warm-white/5 border border-warm-white/10 rounded-xl p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Linke Spalte: Eingaben */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-warm-white/50 mb-3">Ihr Pflegegrad</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(pg => (
                  <button
                    key={pg}
                    onClick={() => setPflegegrad(pg)}
                    className={`w-11 h-11 rounded-lg text-sm font-semibold transition-all ${
                      pflegegrad === pg
                        ? 'bg-terra text-white'
                        : 'bg-warm-white/10 text-warm-white/60 hover:bg-warm-white/20'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-warm-white/50 mb-3">Zeitraum</p>
              <div className="flex gap-2">
                {[{ val: 'monat' as const, label: 'Pro Monat' }, { val: 'jahr' as const, label: 'Pro Jahr' }].map(o => (
                  <button
                    key={o.val}
                    onClick={() => setZeitraum(o.val)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      zeitraum === o.val
                        ? 'bg-terra text-white'
                        : 'bg-warm-white/10 text-warm-white/60 hover:bg-warm-white/20'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Ergebnis */}
          <div className="bg-terra/10 border border-terra/20 rounded-xl p-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-widest uppercase text-terra-light mb-2">Ihr Anspruch</p>
            <p className="font-serif text-5xl font-semibold text-warm-white mb-1">
              {betrag.toFixed(2).replace('.', ',')} €
            </p>
            <p className="text-sm text-warm-white/50">{einheit} — vollständig von der Pflegekasse</p>
            <div className="mt-4 pt-4 border-t border-warm-white/10">
              <p className="text-xs text-warm-white/40">
                Pflegegrad {pflegegrad} · § 40 SGB XI · gesetzlicher Anspruch
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
