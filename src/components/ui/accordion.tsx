'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface AccordionItem {
  frage: string
  antwort: string
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  const [offen, setOffen] = useState<number | null>(null)

  return (
    <div className={clsx('divide-y divide-mid-gray', className)}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex justify-between items-center py-4 text-left gap-4"
            onClick={() => setOffen(offen === i ? null : i)}
          >
            <span className="font-medium text-sm text-dark">{item.frage}</span>
            <span className={clsx(
              'flex-shrink-0 w-5 h-5 rounded-full border border-mid-gray flex items-center justify-center text-warm-gray transition-transform',
              offen === i ? 'rotate-45' : ''
            )}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          </button>
          {offen === i && (
            <div className="pb-4 text-sm text-warm-gray leading-relaxed">
              {item.antwort}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
