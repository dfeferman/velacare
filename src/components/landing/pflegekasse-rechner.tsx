'use client'

import Link from 'next/link'
import { useState } from 'react'

const MONATSBETRAG = 42

const PG_LABELS: Record<number, { sub: string }> = {
  1: { sub: 'Gering' },
  2: { sub: 'Erheblich' },
  3: { sub: 'Schwer' },
  4: { sub: 'Schwerst' },
  5: { sub: 'Extrem' },
}

/** Pflegekasse-Rechner — Anmutung wireframes/01-startseite-hero-zuerst (dunkle Sektion) */
export function PflegekasseRechner() {
  const [pflegegrad, setPflegegrad] = useState(3)
  const [zeitraum, setZeitraum] = useState<'monat' | 'jahr'>('jahr')

  const betrag = zeitraum === 'monat' ? MONATSBETRAG : MONATSBETRAG * 12
  const einheit = zeitraum === 'monat' ? 'Monat' : 'Jahr'

  return (
    <section className="bg-dark px-6 py-10 text-terra-pale">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <span className="mb-3 inline-block rounded-full bg-terra/20 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-terra-light">
            Pflegekasse-Rechner
          </span>
          <h2 className="mb-2 font-serif text-2xl font-bold leading-tight text-terra-pale md:text-3xl">
            Wie viel Geld haben Sie bereits verpasst?
          </h2>
          <p className="max-w-xl text-xs text-terra-pale/60">
            Haben Sie Anspruch auf 42 € pro Monat? Prüfen Sie es in 10 Sekunden.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-terra-pale/40">
                Pflegegrad wählen
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((pg) => {
                  const { sub } = PG_LABELS[pg]
                  const active = pflegegrad === pg
                  return (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPflegegrad(pg)}
                      className={`group flex flex-col items-center rounded-lg border py-2 transition-all ${
                        active
                          ? 'border-terra bg-terra text-white'
                          : 'border-white/10 bg-white/5 text-terra-pale hover:bg-terra hover:text-white'
                      }`}
                    >
                      <span className="text-base font-bold">{pg}</span>
                      <span
                        className={`text-[7px] uppercase opacity-50 group-hover:opacity-90 ${active ? 'font-bold opacity-80' : ''}`}
                      >
                        {sub}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-terra-pale/40">
                Anzeige
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ val: 'monat' as const, label: 'Pro Monat' }, { val: 'jahr' as const, label: 'Pro Jahr' }].map(
                  (o) => (
                    <button
                      key={o.val}
                      type="button"
                      onClick={() => setZeitraum(o.val)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/10 ${
                        zeitraum === o.val ? 'bg-white/10' : 'bg-white/5'
                      }`}
                    >
                      <span className="text-terra-pale">{o.label}</span>
                      <span className="text-[10px] text-terra-pale/50">▼</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-sage/20 bg-sage/10 p-3">
              <span className="text-lg text-sage-light" aria-hidden>
                ℹ
              </span>
              <div className="text-[9px] leading-relaxed text-sage-light">
                <span className="mb-0.5 block font-bold">Gut zu wissen</span>
                Alle Pflegegrade berechtigen zum gleichen Betrag — 42 € pro Monat.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div>
              <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-terra-light">
                Ihr Anspruch
              </label>
              <p className="mb-2 text-[9px] text-white/40">
                {zeitraum === 'jahr' ? 'Hochrechnung 12 Monate' : 'Monatlicher Betrag'} · Pflegegrad {pflegegrad}
              </p>
              <div className="mb-1 text-4xl font-bold leading-none text-terra">
                {betrag.toFixed(2).replace('.', ',')} €
              </div>
              <p className="text-[9px] text-white/30">§ 40 SGB XI — von der Pflegekasse</p>
            </div>
            <div className="space-y-2 rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] text-terra-pale/80">
                <span className="opacity-40">Monatlicher Anspruch</span>
                <span className="font-bold">42,00 €</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[9px]">
                <span className="font-bold text-terra-light">Anzeige ({einheit})</span>
                <span className="text-base font-bold text-terra-light">
                  {betrag.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            </div>
            <Link
              href="/beantragen"
              className="w-full rounded-lg bg-terra py-3 text-center text-xs font-bold text-white shadow-lg transition-all hover:bg-terra-dark active:scale-95"
            >
              Jetzt kostenlos beantragen →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
