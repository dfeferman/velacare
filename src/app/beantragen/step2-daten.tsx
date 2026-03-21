'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'

const schema = z.object({
  vorname: z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname: z.string().min(2, 'Mindestens 2 Zeichen'),
  geburtsdatum: z.string().min(1, 'Pflichtfeld'),
  strasse: z.string().min(3, 'Pflichtfeld'),
  plz: z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
  ort: z.string().min(2, 'Pflichtfeld'),
  krankenkasse: z.string().min(2, 'Pflichtfeld'),
  telefon: z.string().min(6, 'Pflichtfeld'),
  email: z.string().email('Gültige E-Mail-Adresse'),
  passwort: z.string().min(8, 'Mindestens 8 Zeichen'),
})

type FormData = z.infer<typeof schema>
type Errors = Partial<Record<keyof FormData, string>>

interface Step2Props {
  onWeiter: (data: FormData) => void
  onZurueck: () => void
}

export function Step2Daten({ onWeiter, onZurueck }: Step2Props) {
  const [form, setForm] = useState<Partial<FormData>>({})
  const [errors, setErrors] = useState<Errors>({})

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleWeiter = () => {
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Errors = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onWeiter(result.data)
  }

  const field = (name: keyof FormData, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-dark mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[name] as string) ?? ''}
        onChange={set(name)}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-warm-white focus:outline-none focus:ring-2 focus:ring-terra/30 transition-colors ${
          errors[name] ? 'border-danger' : 'border-mid-gray focus:border-terra'
        }`}
      />
      {errors[name] && <p className="text-xs text-danger mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Progress */}
      <ProgressBar schritt={2} gesamtSchritte={4} label="Persönliche Angaben" />

      <h1 className="font-serif text-3xl font-semibold text-dark mt-6 mb-1">Persönliche Angaben</h1>
      <p className="text-warm-gray text-sm mb-8">Für den Antrag bei Ihrer Krankenkasse</p>

      <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Formular */}
        <div className="space-y-8">
          {/* Daten Pflegebedürftiger */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">Daten des Pflegebedürftigen</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {field('vorname', 'Vorname')}
                {field('nachname', 'Nachname')}
              </div>
              {field('geburtsdatum', 'Geburtsdatum', 'date')}
              {field('krankenkasse', 'Krankenkasse', 'text', 'z.B. AOK Bayern')}
              {field('strasse', 'Straße & Hausnummer', 'text', 'Musterstraße 1')}
              <div className="grid grid-cols-2 gap-4">
                {field('plz', 'PLZ', 'text', '80331')}
                {field('ort', 'Ort', 'text', 'München')}
              </div>
              {field('telefon', 'Telefonnummer', 'tel', '+49 89 12345678')}
            </div>
          </div>

          {/* Konto erstellen */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">Konto erstellen</p>
            <div className="space-y-4">
              {field('email', 'E-Mail-Adresse', 'email', 'ihre@email.de')}
              {field('passwort', 'Passwort festlegen', 'password', 'Mindestens 8 Zeichen')}
              <p className="text-xs text-warm-gray">Damit können Sie Ihre Box jederzeit anpassen.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
            <Button variant="primary" className="flex-1 py-3" onClick={handleWeiter}>
              Weiter zur Box-Auswahl →
            </Button>
          </div>
        </div>

        {/* Sticky Sidebar: Ihr Anspruch */}
        <div className="md:sticky md:top-6 space-y-4">
          <div className="bg-warm-white rounded-xl border border-mid-gray p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ihr Anspruch</p>
            <p className="font-serif text-3xl font-semibold text-terra mb-1">42,00 €</p>
            <p className="text-xs text-warm-gray mb-4">monatlich von der Pflegekasse</p>
            <ul className="space-y-2">
              {[
                'Vollständig kostenfrei',
                'Direktabrechnung mit Kasse',
                'Keine Vertragsbindung',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-dark">
                  <span className="text-sage">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-mid-gray text-xs text-warm-gray">
              Gesetzlicher Anspruch nach § 40 SGB XI
            </div>
          </div>

          {/* Box-Vorschau */}
          <div className="bg-terra-pale rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-terra text-white px-2 py-0.5 rounded-full">Vorschau Box</span>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-xs text-terra font-medium">Ihre persönliche Pflegebox</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
