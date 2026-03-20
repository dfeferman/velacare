'use client'

import Link from 'next/link'

interface FunnelHeaderProps {
  onZurueck?: () => void
  zeigeSchliessen?: boolean
}

export function FunnelHeader({ onZurueck, zeigeSchliessen }: FunnelHeaderProps) {
  return (
    <header className="bg-warm-white border-b border-mid-gray h-14 flex items-center px-4 relative">
      {onZurueck ? (
        <button
          onClick={onZurueck}
          className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Zurück
        </button>
      ) : (
        <div className="w-16" />
      )}

      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="font-serif text-lg font-semibold text-dark">
          Velacare
        </Link>
      </div>

      {zeigeSchliessen && (
        <Link href="/" className="ml-auto text-warm-gray hover:text-dark">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </Link>
      )}
    </header>
  )
}
