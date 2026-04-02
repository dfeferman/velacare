'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { toggleProduktAktiv, deleteProdukt } from '@/app/actions/admin'
import { ProduktPanel, ProduktAdminRow } from './produkt-panel'

export function ProdukteClient({ produkte }: { produkte: ProduktAdminRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [panelOffen,     setPanelOffen]     = useState(false)
  const [editProdukt,    setEditProdukt]    = useState<ProduktAdminRow | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [fehler,         setFehler]         = useState<string | null>(null)

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setFehler(null)
      const result = await action()
      if (result.error) setFehler(result.error)
      else router.refresh()
    })
  }

  const neuesProdukt = () => {
    setEditProdukt(null)
    setPanelOffen(true)
  }

  const bearbeiten = (p: ProduktAdminRow) => {
    setEditProdukt(p)
    setPanelOffen(true)
  }

  const panelErfolgreich = () => {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-3xl font-semibold text-v3-on-surface">Produkte</h1>
          <p className="text-sm text-v3-on-surface-v mt-0.5">{produkte.length} Produkte insgesamt</p>
        </div>
        <button
          onClick={neuesProdukt}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-v3-primary text-white text-sm font-medium hover:bg-v3-primary-mid transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Produkt
        </button>
      </div>

      {fehler && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          {fehler}
        </p>
      )}

      <div className="bg-v3-surface rounded-xl border border-v3-outline/30 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_80px_80px_120px] gap-4 px-5 py-3 border-b border-v3-outline/20 bg-v3-background/40">
          <span className="text-xs font-medium text-v3-on-surface-v uppercase tracking-wide">Produkt</span>
          <span className="text-xs font-medium text-v3-on-surface-v uppercase tracking-wide">Kategorie</span>
          <span className="text-xs font-medium text-v3-on-surface-v uppercase tracking-wide">Preis</span>
          <span className="text-xs font-medium text-v3-on-surface-v uppercase tracking-wide">Status</span>
          <span className="text-xs font-medium text-v3-on-surface-v uppercase tracking-wide text-right">Aktionen</span>
        </div>

        {produkte.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-v3-on-surface-v">
            Noch keine Produkte angelegt.
          </div>
        )}

        {produkte.map(p => (
          <div
            key={p.id}
            className="grid grid-cols-[1fr_140px_80px_80px_120px] gap-4 items-center px-5 py-4 border-b border-v3-outline/10 last:border-none hover:bg-v3-background/30 transition-colors"
          >
            {/* Name + Hersteller */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-v3-on-surface truncate">{p.name}</p>
              <p className="text-xs text-v3-on-surface-v truncate">{p.hersteller}</p>
              {p.varianten?.mengenOptionen?.length ? (
                <p className="text-xs text-v3-primary mt-0.5">
                  Größen: {p.varianten.mengenOptionen.join(', ')}
                </p>
              ) : null}
            </div>

            {/* Kategorie */}
            <span className="text-sm text-v3-on-surface-v capitalize">{p.kategorie}</span>

            {/* Preis */}
            <span className="text-sm text-v3-on-surface">
              {p.preis.toFixed(2).replace('.', ',')} €
            </span>

            {/* Status */}
            <div>
              <Badge variant={p.aktiv ? 'sage' : 'gray'}>
                {p.aktiv ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>

            {/* Aktionen */}
            <div className="flex items-center justify-end gap-1.5">
              {/* Toggle aktiv */}
              <button
                title={p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                disabled={isPending}
                onClick={() => run(() => toggleProduktAktiv(p.id, !p.aktiv))}
                className="p-1.5 rounded-lg text-v3-on-surface-v hover:bg-v3-outline/10 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {p.aktiv
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                </svg>
              </button>

              {/* Bearbeiten */}
              <button
                title="Bearbeiten"
                disabled={isPending}
                onClick={() => bearbeiten(p)}
                className="p-1.5 rounded-lg text-v3-on-surface-v hover:bg-v3-outline/10 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Löschen */}
              {confirmDeleteId === p.id ? (
                <div className="flex items-center gap-1">
                  <button
                    title="Endgültig löschen"
                    disabled={isPending}
                    onClick={() => { run(() => deleteProdukt(p.id)); setConfirmDeleteId(null) }}
                    className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-xs font-medium px-2"
                  >
                    Löschen
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="p-1.5 rounded-lg text-v3-on-surface-v hover:bg-v3-outline/10 transition-colors text-xs px-2"
                  >
                    Nein
                  </button>
                </div>
              ) : (
                <button
                  title="Löschen"
                  disabled={isPending}
                  onClick={() => setConfirmDeleteId(p.id)}
                  className="p-1.5 rounded-lg text-v3-on-surface-v hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ProduktPanel
        offen={panelOffen}
        onSchliessen={() => setPanelOffen(false)}
        produkt={editProdukt}
        onErfolgreich={panelErfolgreich}
      />
    </>
  )
}
