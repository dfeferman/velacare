'use client'

import Link from 'next/link'
import { useState } from 'react'

const MONATSBETRAG = 42

const PG_LABELS: Record<number, string> = {
  1: 'Gering',
  2: 'Erheblich',
  3: 'Schwer',
  4: 'Schwerst',
  5: 'Extrem',
}

export function PflegekasseRechner() {
  const [pflegegrad, setPflegegrad] = useState(3)
  const [zeitraum, setZeitraum] = useState<'monat' | 'jahr'>('jahr')

  const betrag = zeitraum === 'monat' ? MONATSBETRAG : MONATSBETRAG * 12
  const einheit = zeitraum === 'monat' ? 'Monat' : 'Jahr'

  return (
    <section
      className="px-6 py-14"
      style={{ background: '#261E17' }}
    >
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <span
            className="mb-3 inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,114,89,0.2)', color: '#A8C9B5' }}
          >
            Pflegekasse-Rechner
          </span>
          <h2
            className="mb-2 font-newsreader text-2xl font-semibold leading-tight md:text-3xl"
            style={{ color: '#FFFDF7' }}
          >
            Wie viel steht Ihnen monatlich zu?
          </h2>
          <p className="max-w-xl text-xs" style={{ color: 'rgba(255,253,247,0.45)' }}>
            Jeder Pflegegrad berechtigt zu 42 € pro Monat nach § 40 SGB XI. Prüfen Sie Ihren Anspruch in 10 Sekunden.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

          {/* Left: Controls */}
          <div className="space-y-6">

            {/* Pflegegrad selector */}
            <div>
              <label
                className="mb-2 block text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,253,247,0.35)' }}
              >
                Pflegegrad wählen
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((pg) => {
                  const active = pflegegrad === pg
                  return (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPflegegrad(pg)}
                      className="group flex flex-col items-center rounded-lg border py-2 transition-all"
                      style={{
                        background: active ? '#4A7259' : 'rgba(255,255,255,0.05)',
                        borderColor: active ? '#4A7259' : 'rgba(255,255,255,0.1)',
                        color: active ? 'white' : 'rgba(255,253,247,0.7)',
                        boxShadow: active ? '0 2px 8px rgba(74,114,89,0.3)' : 'none',
                      }}
                    >
                      <span className="text-base font-bold">{pg}</span>
                      <span className="text-[7px] uppercase" style={{ opacity: active ? 0.9 : 0.4 }}>
                        {PG_LABELS[pg]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Zeitraum toggle */}
            <div>
              <label
                className="mb-2 block text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,253,247,0.35)' }}
              >
                Anzeige
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'monat' as const, label: 'Pro Monat' },
                  { val: 'jahr' as const, label: 'Pro Jahr' },
                ].map((o) => (
                  <button
                    key={o.val}
                    type="button"
                    onClick={() => setZeitraum(o.val)}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors"
                    style={{
                      background: zeitraum === o.val ? 'rgba(74,114,89,0.2)' : 'rgba(255,255,255,0.04)',
                      borderColor: zeitraum === o.val ? 'rgba(74,114,89,0.4)' : 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,253,247,0.8)',
                    }}
                  >
                    <span>{o.label}</span>
                    <span style={{ color: 'rgba(255,253,247,0.3)', fontSize: 10 }}>▼</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div
              className="flex items-start gap-2.5 rounded-lg p-3"
              style={{
                background: 'rgba(74,114,89,0.1)',
                border: '1px solid rgba(74,114,89,0.2)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#A8C9B5" strokeWidth="1.8" className="mt-0.5 h-4 w-4 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
              <div className="text-[9px] leading-relaxed" style={{ color: '#A8C9B5' }}>
                <span className="mb-0.5 block font-bold">Gut zu wissen</span>
                Alle Pflegegrade berechtigen zum gleichen Betrag — 42 € pro Monat nach § 40 SGB XI.
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <label
                className="mb-1 block text-[9px] font-bold uppercase tracking-widest"
                style={{ color: '#A8C9B5' }}
              >
                Ihr Anspruch
              </label>
              <p className="mb-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {zeitraum === 'jahr' ? 'Hochrechnung 12 Monate' : 'Monatlicher Betrag'} · Pflegegrad {pflegegrad}
              </p>
              <div
                className="mb-1 font-newsreader text-4xl font-bold leading-none"
                style={{ color: '#4A7259' }}
              >
                {betrag.toFixed(2).replace('.', ',')} €
              </div>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                § 40 SGB XI — von der Pflegekasse
              </p>
            </div>

            <div
              className="space-y-2 rounded-lg p-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="flex items-center justify-between text-[9px]"
                style={{ color: 'rgba(255,253,247,0.6)' }}
              >
                <span style={{ opacity: 0.5 }}>Monatlicher Anspruch</span>
                <span className="font-bold">42,00 €</span>
              </div>
              <div
                className="flex items-center justify-between border-t pt-1.5 text-[9px]"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="font-bold" style={{ color: '#A8C9B5' }}>
                  Anzeige ({einheit})
                </span>
                <span className="text-base font-bold" style={{ color: '#A8C9B5' }}>
                  {betrag.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            </div>

            <Link
              href="/beantragen"
              className="ripple-btn w-full rounded-xl py-3 text-center text-xs font-semibold text-white transition-all active:scale-[.98]"
              style={{
                background: '#4A7259',
                boxShadow: '0 4px 14px rgba(74,114,89,0.3)',
              }}
            >
              Jetzt kostenlos beantragen →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
