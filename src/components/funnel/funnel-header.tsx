'use client'

import Link from 'next/link'

interface FunnelHeaderProps {
  schritt?: 1 | 2 | 3
  onZurueck?: () => void
  zeigeSchliessen?: boolean
}

const SCHRITTE = [
  { nr: 1 as const, label: 'Ihre Box' },
  { nr: 2 as const, label: 'Ihre Daten' },
  { nr: 3 as const, label: 'Bestätigung' },
]

export function FunnelHeader({ schritt, onZurueck, zeigeSchliessen }: FunnelHeaderProps) {
  return (
    <header className="sticky top-[60px] z-40 bg-v3-surface/95 border-b border-v3-outline/30 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto h-14 flex items-center px-4 gap-3">

        {/* Zurück */}
        {onZurueck ? (
          <button
            onClick={onZurueck}
            aria-label="Zum vorherigen Schritt"
            className="flex items-center gap-1.5 text-sm text-v3-on-surface-v hover:text-v3-on-surface transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2 rounded shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline text-sm">Zurück</span>
          </button>
        ) : (
          <div className="w-8 shrink-0" />
        )}

        {/* Schritt-Indikator */}
        {schritt && (
          <nav aria-label="Fortschritt" className="flex-1 flex items-center justify-center gap-1.5">
            {SCHRITTE.map((s, i) => {
              const done   = s.nr < schritt
              const active = s.nr === schritt
              return (
                <div key={s.nr} className="flex items-center gap-1.5">

                  {/* Step Pill */}
                  <div
                    aria-current={active ? 'step' : undefined}
                    className={[
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-300',
                      active
                        ? 'bg-v3-primary text-white shadow-sm shadow-v3-primary/30'
                        : done
                        ? 'bg-v3-primary-pale text-v3-primary'
                        : 'text-v3-on-surface-v/50',
                    ].join(' ')}
                  >
                    {/* Icon */}
                    <span className={[
                      'flex items-center justify-center w-4 h-4 rounded-full shrink-0 text-[10px] font-bold transition-all duration-300',
                      active ? 'bg-white/25 text-white'
                      : done  ? 'bg-v3-primary text-white'
                      : 'bg-v3-outline/40 text-v3-on-surface-v/60',
                    ].join(' ')}>
                      {done ? (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                          <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : s.nr}
                    </span>
                    {/* Label */}
                    <span className="text-xs font-medium leading-none whitespace-nowrap">
                      {s.label}
                    </span>
                  </div>

                  {/* Connector */}
                  {i < SCHRITTE.length - 1 && (
                    <div className="relative w-6 h-[2px] rounded-full overflow-hidden bg-v3-outline/30 shrink-0">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{
                          width: done ? '100%' : '0%',
                          background: '#4A7259',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}

        {/* Schließen */}
        {zeigeSchliessen ? (
          <Link
            href="/"
            aria-label="Antrag schließen"
            className="text-v3-on-surface-v hover:text-v3-on-surface transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2 rounded"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        ) : (
          <div className="w-8 shrink-0" />
        )}

      </div>
    </header>
  )
}
