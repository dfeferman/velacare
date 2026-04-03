'use client'

import { useState, useEffect } from 'react'
import { createProdukt, updateProdukt, ProduktFormData } from '@/app/actions/admin'
import type { ProduktAdminRow } from './types'

export type { ProduktAdminRow }

interface ProduktPanelProps {
  offen:         boolean
  onSchliessen:  () => void
  produkt?:      ProduktAdminRow | null
  onErfolgreich: () => void
}

type KategorieEnum = ProduktFormData['kategorie']

const KATEGORIEN: { value: KategorieEnum; label: string }[] = [
  { value: 'handschuhe',    label: 'Handschuhe' },
  { value: 'desinfektion',  label: 'Desinfektion' },
  { value: 'mundschutz',    label: 'Mundschutz' },
  { value: 'schutzkleidung',label: 'Schutzkleidung' },
  { value: 'hygiene',       label: 'Hygiene' },
  { value: 'sonstiges',     label: 'Sonstiges' },
]

const GROESSEN = ['S', 'M', 'L', 'XL'] as const

const LEER: ProduktFormData = {
  name:                  '',
  kategorie:             'sonstiges',
  preis:                 0,
  beschreibung:          '',
  hersteller:            '',
  pflichtkennzeichnung:  '',
  aktiv:                 true,
  sortierung:            0,
  mengenOptionen:        [],
}

const labelBase = 'block text-xs font-medium text-v3-on-surface-v uppercase tracking-wide mb-1.5'
const inputBase = 'w-full bg-v3-surface border border-v3-outline/60 rounded-lg px-4 py-3 text-sm text-v3-on-surface placeholder:text-v3-on-surface-v/50 focus:outline-none focus:border-v3-primary/60 focus:ring-1 focus:ring-v3-primary/20 transition'

export function ProduktPanel({ offen, onSchliessen, produkt, onErfolgreich }: ProduktPanelProps) {
  const [form,    setForm]    = useState<ProduktFormData>(LEER)
  const [loading, setLoading] = useState(false)
  const [fehler,  setFehler]  = useState<string | null>(null)

  // Pre-fill when editing
  useEffect(() => {
    if (offen) {
      setFehler(null)
      if (produkt) {
        setForm({
          name:                  produkt.name,
          kategorie:             produkt.kategorie as KategorieEnum,
          preis:                 produkt.preis,
          beschreibung:          produkt.beschreibung,
          hersteller:            produkt.hersteller,
          pflichtkennzeichnung:  produkt.pflichtkennzeichnung ?? '',
          aktiv:                 produkt.aktiv,
          sortierung:            produkt.sortierung,
          mengenOptionen:        produkt.varianten?.mengenOptionen ?? [],
        })
      } else {
        setForm(LEER)
      }
    }
  }, [offen, produkt])

  // ESC to close
  useEffect(() => {
    if (!offen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSchliessen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [offen, onSchliessen])

  const set = <K extends keyof ProduktFormData>(key: K, value: ProduktFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleGroesse = (gr: string) => {
    const current = form.mengenOptionen ?? []
    set('mengenOptionen', current.includes(gr) ? current.filter(g => g !== gr) : [...current, gr])
  }

  const handleSubmit = async () => {
    if (!form.name.trim())        { setFehler('Name ist Pflichtfeld.'); return }
    if (!form.beschreibung.trim()){ setFehler('Beschreibung ist Pflichtfeld.'); return }
    if (!form.hersteller.trim())  { setFehler('Hersteller ist Pflichtfeld.'); return }

    setLoading(true)
    setFehler(null)

    const payload: ProduktFormData = {
      ...form,
      mengenOptionen: form.kategorie === 'handschuhe' ? (form.mengenOptionen ?? []) : [],
    }

    const result = produkt
      ? await updateProdukt(produkt.id, payload)
      : await createProdukt(payload)

    setLoading(false)
    if (result.error) { setFehler(result.error); return }
    onErfolgreich()
    onSchliessen()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-v3-on-surface/40 z-40 transition-opacity duration-300 ${offen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onSchliessen}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-v3-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${offen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-modal="true"
        role="dialog"
        aria-label={produkt ? 'Produkt bearbeiten' : 'Neues Produkt'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-v3-outline/20 flex-shrink-0">
          <h2 className="font-newsreader text-xl text-v3-on-surface">
            {produkt ? 'Produkt bearbeiten' : 'Neues Produkt'}
          </h2>
          <button
            onClick={onSchliessen}
            aria-label="Schließen"
            className="p-1.5 rounded-lg text-v3-on-surface-v hover:bg-v3-outline/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Name */}
          <div>
            <label className={labelBase}>Produktname *</label>
            <input
              type="text"
              className={inputBase}
              placeholder="z.B. Nitrilhandschuhe"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className={labelBase}>Kategorie *</label>
            <select
              className={inputBase}
              value={form.kategorie}
              onChange={e => set('kategorie', e.target.value as KategorieEnum)}
            >
              {KATEGORIEN.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          {/* Preis */}
          <div>
            <label className={labelBase}>Preis (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputBase}
              placeholder="0,00"
              value={form.preis}
              onChange={e => set('preis', parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-v3-on-surface-v mt-1.5">
              Intern — wird Kunden nicht angezeigt. Budget-% wird automatisch berechnet.
            </p>
          </div>

          {/* Beschreibung */}
          <div>
            <label className={labelBase}>Beschreibung *</label>
            <textarea
              rows={3}
              className={inputBase}
              placeholder="Kurze Produktbeschreibung für Kunden…"
              value={form.beschreibung}
              onChange={e => set('beschreibung', e.target.value)}
            />
          </div>

          {/* Hersteller */}
          <div>
            <label className={labelBase}>Hersteller *</label>
            <input
              type="text"
              className={inputBase}
              placeholder="z.B. Sempermed"
              value={form.hersteller}
              onChange={e => set('hersteller', e.target.value)}
            />
          </div>

          {/* Pflichtkennzeichnung */}
          <div>
            <label className={labelBase}>Pflichtkennzeichnung</label>
            <textarea
              rows={2}
              className={inputBase}
              placeholder="Optional: gesetzliche Pflichtangaben…"
              value={form.pflichtkennzeichnung ?? ''}
              onChange={e => set('pflichtkennzeichnung', e.target.value)}
            />
          </div>

          {/* Größen-Chips — nur für Handschuhe */}
          {form.kategorie === 'handschuhe' && (
            <div>
              <label className={labelBase}>Verfügbare Größen</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {GROESSEN.map(gr => {
                  const aktiv = form.mengenOptionen?.includes(gr) ?? false
                  return (
                    <button
                      key={gr}
                      type="button"
                      onClick={() => toggleGroesse(gr)}
                      className={[
                        'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer',
                        aktiv
                          ? 'bg-v3-primary border-v3-primary text-white'
                          : 'border-v3-outline/40 text-v3-on-surface-v hover:border-v3-primary/50',
                      ].join(' ')}
                    >
                      {gr}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-v3-on-surface-v mt-1.5">
                Kunden können beim Zusammenstellen ihrer Box eine Größe wählen.
              </p>
            </div>
          )}

          {/* Sortierung */}
          <div>
            <label className={labelBase}>Sortierung</label>
            <input
              type="number"
              min="0"
              className={inputBase}
              value={form.sortierung}
              onChange={e => set('sortierung', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-v3-on-surface-v mt-1.5">Niedrigere Zahl = weiter oben.</p>
          </div>

          {/* Aktiv */}
          <div className="flex items-center gap-3">
            <input
              id="aktiv-checkbox"
              type="checkbox"
              className="w-4 h-4 accent-v3-primary cursor-pointer"
              checked={form.aktiv}
              onChange={e => set('aktiv', e.target.checked)}
            />
            <label htmlFor="aktiv-checkbox" className="text-sm text-v3-on-surface cursor-pointer select-none">
              Produkt aktiv (für Kunden sichtbar)
            </label>
          </div>

          {/* Fehler */}
          {fehler && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {fehler}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-v3-outline/20 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onSchliessen}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-v3-on-surface-v border border-v3-outline/40 hover:bg-v3-outline/10 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-v3-primary text-white hover:bg-v3-primary-mid transition-colors disabled:opacity-50"
          >
            {loading ? 'Speichern…' : (produkt ? 'Speichern' : 'Erstellen')}
          </button>
        </div>
      </aside>
    </>
  )
}
