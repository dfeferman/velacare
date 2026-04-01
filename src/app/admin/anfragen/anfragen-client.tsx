'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AnfrageItem {
  id:          string
  kategorie:   string
  nachricht:   string
  status:      string
  antwort:     string | null
  erstellt_am: Date | string
  kunde: { vorname: string; nachname: string }
}

const fmt = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' })

export function AnfragenClient({ anfragen }: { anfragen: AnfrageItem[] }) {
  const [antworten,   setAntworten]   = useState<Record<string, string>>({})
  const [beantwortet, setBeantwortet] = useState<Set<string>>(new Set())

  return (
    <div className="space-y-4">
      {anfragen.map(a => {
        const istBeantwortet = beantwortet.has(a.id) || a.status === 'beantwortet'
        return (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium">
                  {a.kunde.vorname} {a.kunde.nachname}
                </p>
                <p className="text-xs text-warm-gray">
                  {fmt.format(new Date(a.erstellt_am))}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="terra">{a.kategorie}</Badge>
                <Badge variant={istBeantwortet ? 'sage' : 'amber'}>
                  {istBeantwortet ? 'beantwortet' : 'offen'}
                </Badge>
              </div>
            </div>
            <p className="text-sm bg-bg rounded p-3 mb-3">{a.nachricht}</p>
            {a.antwort && (
              <p className="text-xs text-sage bg-sage-pale rounded p-2 mb-3">
                <strong>Antwort:</strong> {a.antwort}
              </p>
            )}
            {!istBeantwortet && (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Antwort eingeben..."
                  value={antworten[a.id] ?? ''}
                  onChange={e =>
                    setAntworten(prev => ({ ...prev, [a.id]: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
                />
                <Button
                  variant="primary"
                  className="text-xs"
                  onClick={() =>
                    setBeantwortet(prev => {
                      const next = new Set(prev)
                      next.add(a.id)
                      return next
                    })
                  }
                >
                  Antwort senden (Demo)
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
