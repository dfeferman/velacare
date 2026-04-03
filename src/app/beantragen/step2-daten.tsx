'use client'

import { useState } from 'react'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'

interface Step2Props {
  onWeiter:  (data: Step2Data) => void
  onZurueck: () => void
}

type FieldErrors = Partial<Record<keyof Step2Data | 'lieferadresse', string>>

// v3 Input-Styling
const inputBase = [
  'w-full bg-v3-surface border border-v3-outline/60 rounded-lg px-4 py-3',
  'text-v3-on-surface placeholder:text-v3-on-surface-v/50 text-sm',
  'focus:outline-none focus:border-v3-primary focus-visible:ring-2 focus-visible:ring-v3-primary/20',
  'transition-colors duration-150',
].join(' ')

const inputErr = [
  'w-full bg-v3-surface border border-[#E05A3A] rounded-lg px-4 py-3',
  'text-v3-on-surface placeholder:text-v3-on-surface-v/50 text-sm',
  'focus:outline-none focus:border-[#E05A3A] focus-visible:ring-2 focus-visible:ring-[#E05A3A]/20',
  'transition-colors duration-150',
].join(' ')

const labelBase = 'block text-xs font-medium text-v3-on-surface-v uppercase tracking-wide mb-1.5'
const sectionCard = 'bg-white rounded-xl p-6 mb-5 border border-v3-outline/50 shadow-sm shadow-v3-outline/20'

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
      // Scroll zum ersten Fehler
      setTimeout(() => {
        document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }
    setErrors({})
    onWeiter(result.data)
  }

  const hasError = (field: keyof FieldErrors) => !!errors[field]

  const ErrMsg = ({ field }: { field: keyof FieldErrors }) => {
    if (!errors[field]) return null
    return (
      <p id={`err-${String(field)}`} role="alert" className="text-[#9E2910] text-xs mt-1.5 flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
        </svg>
        {errors[field]}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fade-up">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-v3-on-surface-v mb-3 flex items-center gap-2">
            <span className="eyebrow-dot inline-block w-1.5 h-1.5 rounded-full bg-v3-secondary" aria-hidden="true" />
            Schritt 2 von 3
          </p>
          <div className="deco-rule mb-3" aria-hidden="true" />
          <h1 className="font-newsreader text-3xl text-v3-on-surface mb-2">Ihre Daten</h1>
          <p className="text-v3-on-surface-v text-[15px]">Bitte füllen Sie alle Felder vollständig aus.</p>
        </div>

        {/* ── Pflegebedürftiger ── */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-5">Pflegebedürftiger</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="vorname" className={labelBase}>Vorname</label>
              <input
                id="vorname" name="vorname" autoComplete="given-name"
                className={hasError('vorname') ? inputErr : inputBase}
                aria-invalid={hasError('vorname') || undefined}
                aria-describedby={hasError('vorname') ? 'err-vorname' : undefined}
                value={form.vorname ?? ''} onChange={e => set('vorname', e.target.value)}
              />
              <ErrMsg field="vorname" />
            </div>
            <div>
              <label htmlFor="nachname" className={labelBase}>Nachname</label>
              <input
                id="nachname" name="nachname" autoComplete="family-name"
                className={hasError('nachname') ? inputErr : inputBase}
                aria-invalid={hasError('nachname') || undefined}
                aria-describedby={hasError('nachname') ? 'err-nachname' : undefined}
                value={form.nachname ?? ''} onChange={e => set('nachname', e.target.value)}
              />
              <ErrMsg field="nachname" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="geburtsdatum" className={labelBase}>Geburtsdatum</label>
              <input
                id="geburtsdatum" name="geburtsdatum" type="date" autoComplete="bday"
                className={hasError('geburtsdatum') ? inputErr : inputBase}
                aria-invalid={hasError('geburtsdatum') || undefined}
                aria-describedby={hasError('geburtsdatum') ? 'err-geburtsdatum' : undefined}
                value={form.geburtsdatum ?? ''} onChange={e => set('geburtsdatum', e.target.value)}
              />
              <ErrMsg field="geburtsdatum" />
            </div>
            <div>
              <label htmlFor="pflegegrad" className={labelBase}>Pflegegrad</label>
              <select
                id="pflegegrad" name="pflegegrad"
                className={hasError('pflegegrad') ? inputErr : inputBase}
                aria-invalid={hasError('pflegegrad') || undefined}
                aria-describedby={hasError('pflegegrad') ? 'err-pflegegrad' : undefined}
                value={form.pflegegrad ?? ''} onChange={e => set('pflegegrad', Number(e.target.value))}
              >
                <option value="">Bitte wählen</option>
                {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>Pflegegrad {g}</option>)}
              </select>
              <ErrMsg field="pflegegrad" />
            </div>
          </div>
          <div>
            <label htmlFor="telefon" className={labelBase}>Telefon</label>
            <input
              id="telefon" name="telefon" type="tel" autoComplete="tel"
              className={hasError('telefon') ? inputErr : inputBase}
              aria-invalid={hasError('telefon') || undefined}
              aria-describedby={hasError('telefon') ? 'err-telefon' : undefined}
              value={form.telefon ?? ''} onChange={e => set('telefon', e.target.value)}
            />
            <ErrMsg field="telefon" />
          </div>
        </div>

        {/* ── Krankenkasse ── */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-5">Krankenkasse</h2>
          <div className="mb-4">
            <label htmlFor="krankenkasse" className={labelBase}>Krankenkasse</label>
            <input
              id="krankenkasse" name="krankenkasse"
              placeholder="z. B. AOK Bayern"
              className={hasError('krankenkasse') ? inputErr : inputBase}
              aria-invalid={hasError('krankenkasse') || undefined}
              aria-describedby={hasError('krankenkasse') ? 'err-krankenkasse' : undefined}
              value={form.krankenkasse ?? ''} onChange={e => set('krankenkasse', e.target.value)}
            />
            <ErrMsg field="krankenkasse" />
          </div>
          <div>
            <label htmlFor="versicherungsnummer" className={labelBase}>Versicherungsnummer</label>
            <input
              id="versicherungsnummer" name="versicherungsnummer"
              className={hasError('versicherungsnummer') ? inputErr : inputBase}
              aria-invalid={hasError('versicherungsnummer') || undefined}
              aria-describedby={hasError('versicherungsnummer') ? 'err-versicherungsnummer' : undefined}
              value={form.versicherungsnummer ?? ''} onChange={e => set('versicherungsnummer', e.target.value)}
            />
            <ErrMsg field="versicherungsnummer" />
          </div>
        </div>

        {/* ── Adresse ── */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-5">Adresse</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label htmlFor="strasse" className={labelBase}>Straße</label>
              <input
                id="strasse" name="strasse" autoComplete="address-line1"
                className={hasError('strasse') ? inputErr : inputBase}
                aria-invalid={hasError('strasse') || undefined}
                aria-describedby={hasError('strasse') ? 'err-strasse' : undefined}
                value={form.strasse ?? ''} onChange={e => set('strasse', e.target.value)}
              />
              <ErrMsg field="strasse" />
            </div>
            <div>
              <label htmlFor="hausnummer" className={labelBase}>Hausnr.</label>
              <input
                id="hausnummer" name="hausnummer"
                className={hasError('hausnummer') ? inputErr : inputBase}
                aria-invalid={hasError('hausnummer') || undefined}
                aria-describedby={hasError('hausnummer') ? 'err-hausnummer' : undefined}
                value={form.hausnummer ?? ''} onChange={e => set('hausnummer', e.target.value)}
              />
              <ErrMsg field="hausnummer" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="adresszusatz" className={labelBase}>Adresszusatz <span className="normal-case font-normal text-v3-on-surface-v/60">(optional)</span></label>
            <input
              id="adresszusatz" name="adresszusatz"
              placeholder="Wohnung, Stockwerk, c/o …"
              className={inputBase}
              autoComplete="address-line2"
              value={form.adresszusatz ?? ''} onChange={e => set('adresszusatz', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <label htmlFor="plz" className={labelBase}>PLZ</label>
              <input
                id="plz" name="plz" autoComplete="postal-code" maxLength={5}
                className={hasError('plz') ? inputErr : inputBase}
                aria-invalid={hasError('plz') || undefined}
                aria-describedby={hasError('plz') ? 'err-plz' : undefined}
                value={form.plz ?? ''} onChange={e => set('plz', e.target.value)}
              />
              <ErrMsg field="plz" />
            </div>
            <div className="col-span-2">
              <label htmlFor="ort" className={labelBase}>Ort</label>
              <input
                id="ort" name="ort" autoComplete="address-level2"
                className={hasError('ort') ? inputErr : inputBase}
                aria-invalid={hasError('ort') || undefined}
                aria-describedby={hasError('ort') ? 'err-ort' : undefined}
                value={form.ort ?? ''} onChange={e => set('ort', e.target.value)}
              />
              <ErrMsg field="ort" />
            </div>
          </div>

          {/* Abweichende Lieferadresse */}
          <label htmlFor="lieferadresse_abweichend" className="flex items-center gap-3 cursor-pointer group">
            <input
              id="lieferadresse_abweichend"
              type="checkbox"
              checked={form.lieferadresse_abweichend ?? false}
              onChange={e => set('lieferadresse_abweichend', e.target.checked)}
              className="w-4 h-4 rounded accent-[#4A7259] cursor-pointer"
            />
            <span className="text-sm text-v3-on-surface group-hover:text-v3-primary transition-colors">
              Lieferadresse weicht von der Wohnadresse ab
            </span>
          </label>

          {form.lieferadresse_abweichend && (
            <div className="mt-4 pl-4 border-l-2 border-v3-primary/30 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label htmlFor="lief-strasse" className={labelBase}>Straße (Lieferung)</label>
                  <input
                    id="lief-strasse"
                    className={inputBase}
                    value={form.lieferadresse?.strasse ?? ''} onChange={e => setLieferadresse('strasse', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lief-hausnummer" className={labelBase}>Hausnr.</label>
                  <input
                    id="lief-hausnummer"
                    className={inputBase}
                    value={form.lieferadresse?.hausnummer ?? ''} onChange={e => setLieferadresse('hausnummer', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lief-plz" className={labelBase}>PLZ</label>
                  <input
                    id="lief-plz" maxLength={5}
                    className={inputBase}
                    value={form.lieferadresse?.plz ?? ''} onChange={e => setLieferadresse('plz', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="lief-ort" className={labelBase}>Ort</label>
                  <input
                    id="lief-ort"
                    className={inputBase}
                    value={form.lieferadresse?.ort ?? ''} onChange={e => setLieferadresse('ort', e.target.value)}
                  />
                </div>
              </div>
              <ErrMsg field="lieferadresse" />
            </div>
          )}
        </div>

        {/* ── Versorgungssituation ── */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-5">Versorgungssituation</h2>
          <fieldset className="mb-4" aria-label="Versorgungssituation wählen">
            <div className="flex gap-4">
              {(['erstversorgung', 'wechsel'] as const).map(val => (
                <label key={val} htmlFor={`vers-${val}`} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    id={`vers-${val}`}
                    type="radio"
                    name="versorgungssituation"
                    value={val}
                    checked={form.versorgungssituation === val}
                    onChange={() => set('versorgungssituation', val)}
                    className="w-4 h-4 accent-[#4A7259] cursor-pointer"
                  />
                  <span className="text-sm text-v3-on-surface group-hover:text-v3-primary transition-colors">
                    {val === 'erstversorgung' ? 'Erstversorgung' : 'Anbieterwechsel'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="beratung" className="flex items-center gap-2.5 cursor-pointer group">
            <input
              id="beratung"
              type="checkbox"
              checked={form.beratung ?? false}
              onChange={e => set('beratung', e.target.checked)}
              className="w-4 h-4 rounded accent-[#4A7259] cursor-pointer"
            />
            <span className="text-sm text-v3-on-surface group-hover:text-v3-primary transition-colors">
              Ich möchte eine persönliche Beratung
            </span>
          </label>
        </div>

        {/* ── Konto erstellen ── */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-1">Konto erstellen</h2>
          <p className="text-v3-on-surface-v text-sm mb-5 leading-relaxed">
            Sie erhalten per E-Mail einen Einmallink — kein Passwort nötig.
          </p>
          <div>
            <label htmlFor="email" className={labelBase}>E-Mail-Adresse</label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              placeholder="ihre@email.de"
              className={hasError('email') ? inputErr : inputBase}
              aria-invalid={hasError('email') || undefined}
              aria-describedby={hasError('email') ? 'err-email' : undefined}
              value={form.email ?? ''} onChange={e => set('email', e.target.value)}
            />
            <ErrMsg field="email" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onZurueck}
            className="min-h-[44px] px-4 py-2.5 text-v3-on-surface-v hover:text-v3-on-surface transition-colors text-sm cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2 rounded"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zurück
          </button>
          <button
            type="submit"
            className={[
              'ripple-btn min-h-[44px] px-8 py-2.5 rounded-lg bg-v3-primary text-white font-medium text-sm',
              'hover:bg-v3-primary-mid active:bg-v3-primary-dark transition-all duration-200 cursor-pointer',
              'shadow-sm shadow-v3-primary/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
            ].join(' ')}
          >
            Weiter zur Bestätigung
            <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </form>
  )
}
