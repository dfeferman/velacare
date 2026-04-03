'use client'

import { useRef, useState } from 'react'
import ReactSignatureCanvas from 'react-signature-canvas'

interface SignaturPadProps {
  nachname: string
  onChange: (dataUrl: string | null) => void
}

const FONTS = [
  { family: 'Dancing Script' },
  { family: 'Satisfy' },
  { family: 'Kalam' },
] as const

export function SignaturPad({ nachname, onChange }: SignaturPadProps) {
  const sigRef = useRef<ReactSignatureCanvas>(null)
  const [activeFont, setActiveFont] = useState<string | null>(null)

  const handleStrokeEnd = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    onChange(sigRef.current.toDataURL('image/png'))
  }

  const applyFont = async (fontFamily: string) => {
    if (!sigRef.current) return
    const text = nachname.trim() || 'Unterschrift'
    await document.fonts.load(`48px "${fontFamily}"`)
    const canvas = sigRef.current.getCanvas()
    const ctx = canvas.getContext('2d')!
    sigRef.current.clear()
    ctx.font = `48px "${fontFamily}"`
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText(text, 24, Math.round(canvas.height * 0.65))
    setActiveFont(fontFamily)
    onChange(canvas.toDataURL('image/png'))
  }

  const handleClear = () => {
    sigRef.current?.clear()
    setActiveFont(null)
    onChange(null)
  }

  return (
    <div>
      {/* Font buttons */}
      <div className="flex gap-2 mb-3" role="group" aria-label="Schriftart für Unterschrift">
        {FONTS.map(f => (
          <button
            key={f.family}
            type="button"
            onClick={() => applyFont(f.family)}
            className={[
              'flex-1 py-2 px-3 rounded-lg border text-sm transition-all duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
              activeFont === f.family
                ? 'border-v3-primary bg-v3-primary-pale text-v3-primary font-medium'
                : 'border-v3-outline/60 bg-white text-v3-on-surface hover:border-v3-primary/50 hover:bg-v3-primary-pale/30',
            ].join(' ')}
            style={{ fontFamily: f.family }}
            aria-pressed={activeFont === f.family}
          >
            {nachname.trim() || 'Muster'}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="rounded-lg border border-v3-outline/60 bg-white overflow-hidden">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#1a1a1a"
          canvasProps={{
            className: 'w-full',
            style: { height: 140, display: 'block' },
          }}
          onEnd={handleStrokeEnd}
        />
      </div>

      {/* Clear link */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-v3-on-surface-v hover:text-v3-on-surface transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary rounded"
        >
          Löschen
        </button>
      </div>
    </div>
  )
}
