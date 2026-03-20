'use client'

import { useState } from 'react'
import { useMockStore } from '@/lib/mock-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ProdukteAdminPage() {
  const { produkte, updateProdukt, deleteProdukt, addProdukt } = useMockStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [neuerName, setNeuerName] = useState('')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-semibold">Produkte</h1>
        <Button variant="primary" className="text-xs" onClick={() => addProdukt({
          name: 'Neues Produkt',
          beschreibung: 'Beschreibung',
          preis: 5.00,
          kategorie: 'Sonstiges',
          aktiv: true,
          bildUrl: '',
        })}>
          + Produkt hinzufügen
        </Button>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {produkte.map(p => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none">
            <div className="flex-1">
              {editId === p.id ? (
                <input
                  className="border border-terra rounded px-2 py-1 text-sm w-full max-w-xs"
                  value={neuerName}
                  onChange={e => setNeuerName(e.target.value)}
                  onBlur={() => { updateProdukt(p.id, { name: neuerName }); setEditId(null) }}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium">{p.name}</p>
              )}
              <p className="text-xs text-warm-gray">{p.kategorie} · {p.preis.toFixed(2).replace('.', ',')} €</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.aktiv ? 'sage' : 'gray'}>{p.aktiv ? 'Aktiv' : 'Deaktiviert'}</Badge>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditId(p.id); setNeuerName(p.name) }}>Bearbeiten</Button>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => updateProdukt(p.id, { aktiv: !p.aktiv })}>
                {p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
              </Button>
              <Button variant="danger" className="text-xs px-2 py-1" onClick={() => deleteProdukt(p.id)}>Löschen</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
