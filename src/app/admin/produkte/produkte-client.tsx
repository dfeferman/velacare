// src/app/admin/produkte/produkte-client.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  createProdukt,
  updateProduktName,
  toggleProduktAktiv,
  deleteProdukt,
} from '@/app/actions/admin'

interface ProduktItem {
  id:        string
  name:      string
  kategorie: string
  preis:     number
  aktiv:     boolean
}

export function ProdukteClient({ produkte }: { produkte: ProduktItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId,          setEditId]          = useState<string | null>(null)
  const [neuerName,       setNeuerName]        = useState('')
  const [confirmDeleteId, setConfirmDeleteId]  = useState<string | null>(null)
  const [fehler,          setFehler]           = useState<string | null>(null)

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setFehler(null)
      const result = await action()
      if (result.error) setFehler(result.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="primary"
          className="text-xs"
          disabled={isPending}
          onClick={() => run(createProdukt)}
        >
          + Produkt hinzufügen
        </Button>
      </div>

      {fehler && <p className="text-red-600 text-sm mb-4">{fehler}</p>}

      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {produkte.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none"
          >
            <div className="flex-1">
              {editId === p.id ? (
                <input
                  className="border border-terra rounded px-2 py-1 text-sm w-full max-w-xs"
                  value={neuerName}
                  onChange={e => setNeuerName(e.target.value)}
                  onBlur={() => {
                    run(() => updateProduktName(p.id, neuerName))
                    setEditId(null)
                  }}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium">{p.name}</p>
              )}
              <p className="text-xs text-warm-gray">
                {p.kategorie} · {p.preis.toFixed(2).replace('.', ',')} €
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={p.aktiv ? 'sage' : 'gray'}>
                {p.aktiv ? 'Aktiv' : 'Deaktiviert'}
              </Badge>

              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                disabled={isPending}
                onClick={() => { setEditId(p.id); setNeuerName(p.name) }}
              >
                Bearbeiten
              </Button>

              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                disabled={isPending}
                onClick={() => run(() => toggleProduktAktiv(p.id, !p.aktiv))}
              >
                {p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
              </Button>

              {confirmDeleteId === p.id ? (
                <>
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1"
                    disabled={isPending}
                    onClick={() => {
                      run(() => deleteProdukt(p.id))
                      setConfirmDeleteId(null)
                    }}
                  >
                    Sicher löschen
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs px-2 py-1"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Abbrechen
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  className="text-xs px-2 py-1"
                  disabled={isPending}
                  onClick={() => setConfirmDeleteId(p.id)}
                >
                  Löschen
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
