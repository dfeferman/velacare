'use client'

import { useState } from 'react'
import { MOCK_ANFRAGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const KATEGORIEN = ['Box-Inhalt', 'Lieferung', 'Adresse', 'Sonstiges'] as const

export default function AnfragenPage() {
  const anfragen = MOCK_ANFRAGEN.filter(a => a.kundeId === MOCK_KUNDEN[0].id)
  const [nachricht, setNachricht] = useState('')
  const [kat, setKat] = useState<typeof KATEGORIEN[number]>('Sonstiges')
  const [gesendet, setGesendet] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Anfragen</h1>

      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Neue Anfrage</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {KATEGORIEN.map(k => (
            <button key={k} onClick={() => setKat(k)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${kat === k ? 'bg-terra text-white border-terra' : 'border-mid-gray text-warm-gray hover:border-terra'}`}>
              {k}
            </button>
          ))}
        </div>
        <textarea
          value={nachricht}
          onChange={e => setNachricht(e.target.value)}
          placeholder="Ihre Nachricht an Velacare..."
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
        />
        {gesendet && <p className="text-sage text-xs mt-2">✓ Anfrage gesendet</p>}
        <Button variant="primary" className="mt-3" onClick={() => { setGesendet(true); setNachricht('') }}
          disabled={nachricht.trim().length < 5}>
          Anfrage senden
        </Button>
      </div>

      <div className="space-y-3">
        {anfragen.map(a => (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="terra">{a.kategorie}</Badge>
              <Badge variant={a.status === 'offen' ? 'amber' : 'sage'}>{a.status}</Badge>
            </div>
            <p className="text-sm mb-2">{a.nachricht}</p>
            {a.antwort && (
              <div className="bg-sage-pale rounded p-3 text-xs text-sage">
                <strong>Velacare:</strong> {a.antwort}
              </div>
            )}
            <p className="text-xs text-warm-gray mt-2">{a.erstelltAm}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
