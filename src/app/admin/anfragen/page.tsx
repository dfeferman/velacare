'use client'

import { useState } from 'react'
import { MOCK_ANFRAGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AnfragenAdminPage() {
  const [antworten, setAntworten] = useState<Record<string, string>>({})
  const [beantwortet, setBeantwortet] = useState<Set<string>>(new Set())

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Anfragen</h1>
      <div className="space-y-4">
        {MOCK_ANFRAGEN.map(a => {
          const kunde = MOCK_KUNDEN.find(k => k.id === a.kundeId)
          const istBeantwortet = beantwortet.has(a.id) || a.status === 'beantwortet'
          return (
            <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium">{kunde?.vorname} {kunde?.nachname}</p>
                  <p className="text-xs text-warm-gray">{a.erstelltAm}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="terra">{a.kategorie}</Badge>
                  <Badge variant={istBeantwortet ? 'sage' : 'amber'}>{istBeantwortet ? 'beantwortet' : 'offen'}</Badge>
                </div>
              </div>
              <p className="text-sm bg-bg rounded p-3 mb-3">{a.nachricht}</p>
              {a.antwort && <p className="text-xs text-sage bg-sage-pale rounded p-2 mb-3"><strong>Antwort:</strong> {a.antwort}</p>}
              {!istBeantwortet && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Antwort eingeben..."
                    value={antworten[a.id] ?? ''}
                    onChange={e => setAntworten(prev => ({ ...prev, [a.id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
                  />
                  <Button variant="primary" className="text-xs"
                    onClick={() => setBeantwortet(prev => { const next = new Set(prev); next.add(a.id); return next })}>
                    Antwort senden (Demo)
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
