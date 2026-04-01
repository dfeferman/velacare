'use client'

import { useState } from 'react'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'

interface Step2Props {
  onWeiter:  (data: Step2Data) => void
  onZurueck: () => void
}

type FieldErrors = Partial<Record<keyof Step2Data | 'lieferadresse', string>>

const inputBase = 'w-full bg-v2-surface-low text-v2-on-surface px-3 py-2.5 rounded-t-sm border-0 border-b border-v2-outline-v focus:border-v2-primary focus:outline-none transition-colors text-sm'
const labelBase = 'block text-xs text-v2-on-surface-v mb-1'
const sectionCard = 'bg-v2-surface-lowest rounded-xl p-6 mb-4'

export function Step2Daten({ onWeiter, onZurueck }: Step2Props) {
  const [form, setForm] = useState<Partial<Step2Data>>({
    versorgungssituation: 'erstversorgung',
    beratung: false,
    lieferadresse_abweichend: false,
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const set = (key: keyof Step2Data, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setLieferadresse = (key: string, value: string) =>
    setForm(prev => ({
      ...prev,
      lieferadresse: { ...(prev.lieferadresse ?? { strasse: '', hausnummer: '', plz: '', ort: '' }), [key]: value },
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const errs: FieldErrors = {}
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        if (path.startsWith('lieferadresse.')) {
          errs.lieferadresse = issue.message
        } else {
          errs[path as keyof Step2Data] = issue.message
        }
      })
      setErrors(errs)
      return
    }
    setErrors({})
    onWeiter(result.data)
  }

  const err = (field: keyof FieldErrors) =>
    errors[field] ? <p className="text-v2-error text-xs mt-1">{errors[field]}</p> : null

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-v2-surface font-manrope">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-newsreader text-3xl text-v2-on-surface mb-2">Ihre Daten</h1>
        <p className="text-v2-on-surface-v mb-8">Bitte füllen Sie alle Felder vollständig aus.</p>

        {/* Pflegebedürftiger */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Pflegebedürftiger</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Vorname</label>
              <input className={inputBase} value={form.vorname ?? ''} onChange={e => set('vorname', e.target.value)} />
              {err('vorname')}
            </div>
            <div>
              <label className={labelBase}>Nachname</label>
              <input className={inputBase} value={form.nachname ?? ''} onChange={e => set('nachname', e.target.value)} />
              {err('nachname')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Geburtsdatum</label>
              <input type="date" className={inputBase} value={form.geburtsdatum ?? ''} onChange={e => set('geburtsdatum', e.target.value)} />
              {err('geburtsdatum')}
            </div>
            <div>
              <label className={labelBase}>Pflegegrad</label>
              <select className={inputBase} value={form.pflegegrad ?? ''} onChange={e => set('pflegegrad', Number(e.target.value))}>
                <option value="">Bitte wählen</option>
                {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {err('pflegegrad')}
            </div>
          </div>
          <div>
            <label className={labelBase}>Telefon</label>
            <input type="tel" className={inputBase} value={form.telefon ?? ''} onChange={e => set('telefon', e.target.value)} />
            {err('telefon')}
          </div>
        </div>

        {/* Krankenkasse */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Krankenkasse</h2>
          <div className="mb-4">
            <label className={labelBase}>Krankenkasse</label>
            <input className={inputBase} placeholder="z. B. AOK Bayern" value={form.krankenkasse ?? ''} onChange={e => set('krankenkasse', e.target.value)} />
            {err('krankenkasse')}
          </div>
          <div>
            <label className={labelBase}>Versicherungsnummer</label>
            <input className={inputBase} value={form.versicherungsnummer ?? ''} onChange={e => set('versicherungsnummer', e.target.value)} />
            {err('versicherungsnummer')}
          </div>
        </div>

        {/* Adresse */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Adresse</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelBase}>Straße</label>
              <input className={inputBase} value={form.strasse ?? ''} onChange={e => set('strasse', e.target.value)} />
              {err('strasse')}
            </div>
            <div>
              <label className={labelBase}>Hausnummer</label>
              <input className={inputBase} value={form.hausnummer ?? ''} onChange={e => set('hausnummer', e.target.value)} />
              {err('hausnummer')}
            </div>
          </div>
          <div className="mb-4">
            <label className={labelBase}>Adresszusatz (optional)</label>
            <input className={inputBase} placeholder="Wohnung, Stockwerk, c/o …" value={form.adresszusatz ?? ''} onChange={e => set('adresszusatz', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelBase}>PLZ</label>
              <input className={inputBase} maxLength={5} value={form.plz ?? ''} onChange={e => set('plz', e.target.value)} />
              {err('plz')}
            </div>
            <div className="col-span-2">
              <label className={labelBase}>Ort</label>
              <input className={inputBase} value={form.ort ?? ''} onChange={e => set('ort', e.target.value)} />
              {err('ort')}
            </div>
          </div>

          {/* Abweichende Lieferadresse */}
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.lieferadresse_abweichend ?? false}
              onChange={e => set('lieferadresse_abweichend', e.target.checked)}
              className="accent-v2-primary"
            />
            <span className="text-sm text-v2-on-surface">Lieferadresse weicht von der obigen Adresse ab</span>
          </label>

          {form.lieferadresse_abweichend && (
            <div className="mt-4 pl-4 border-l-2 border-v2-outline-v space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelBase}>Straße (Lieferung)</label>
                  <input className={inputBase} value={form.lieferadresse?.strasse ?? ''} onChange={e => setLieferadresse('strasse', e.target.value)} />
                </div>
                <div>
                  <label className={labelBase}>Hausnummer</label>
                  <input className={inputBase} value={form.lieferadresse?.hausnummer ?? ''} onChange={e => setLieferadresse('hausnummer', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>PLZ</label>
                  <input className={inputBase} maxLength={5} value={form.lieferadresse?.plz ?? ''} onChange={e => setLieferadresse('plz', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelBase}>Ort</label>
                  <input className={inputBase} value={form.lieferadresse?.ort ?? ''} onChange={e => setLieferadresse('ort', e.target.value)} />
                </div>
              </div>
              {err('lieferadresse')}
            </div>
          )}
        </div>

        {/* Versorgung */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Versorgungssituation</h2>
          <div className="flex gap-6 mb-4">
            {(['erstversorgung', 'wechsel'] as const).map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="versorgungssituation"
                  value={val}
                  checked={form.versorgungssituation === val}
                  onChange={() => set('versorgungssituation', val)}
                  className="accent-v2-primary"
                />
                <span className="text-sm text-v2-on-surface capitalize">{val === 'erstversorgung' ? 'Erstversorgung' : 'Anbieterwechsel'}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.beratung ?? false}
              onChange={e => set('beratung', e.target.checked)}
              className="accent-v2-primary"
            />
            <span className="text-sm text-v2-on-surface">Ich möchte eine persönliche Beratung</span>
          </label>
        </div>

        {/* Konto erstellen */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Konto erstellen</h2>
          <div className="mb-4">
            <label className={labelBase}>E-Mail-Adresse</label>
            <input type="email" className={inputBase} value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            {err('email')}
            <p className="text-xs text-v2-on-surface-v mt-1">
              Du erhältst per E-Mail einen Einmallink für deinen Kontozugang — kein Passwort nötig.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button type="button" onClick={onZurueck} className="px-6 py-3 text-v2-on-surface-v hover:text-v2-on-surface transition-colors text-sm">
            ← Zurück
          </button>
          <button type="submit" className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium hover:bg-v2-secondary transition-colors">
            Weiter
          </button>
        </div>
      </div>
    </form>
  )
}
