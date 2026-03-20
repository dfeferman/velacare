'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

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
      <label className="block text-xs font-medium text-dark mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[name] as string) ?? ''}
        onChange={set(name)}
        className={`w-full px-3 py-2 rounded-md border text-sm bg-warm-white focus:outline-none focus:ring-2 focus:ring-terra/30 ${
          errors[name] ? 'border-danger' : 'border-mid-gray'
        }`}
      />
      {errors[name] && <p className="text-xs text-danger mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Pflegebedürftige Person</p>
        <div className="grid grid-cols-2 gap-4">
          {field('vorname', 'Vorname')}
          {field('nachname', 'Nachname')}
        </div>
        <div className="mt-4 space-y-4">
          {field('geburtsdatum', 'Geburtsdatum', 'date')}
          {field('strasse', 'Straße & Hausnummer', 'text', 'Musterstraße 1')}
          <div className="grid grid-cols-2 gap-4">
            {field('plz', 'PLZ', 'text', '80331')}
            {field('ort', 'Ort', 'text', 'München')}
          </div>
          {field('krankenkasse', 'Krankenkasse', 'text', 'z.B. AOK Bayern')}
          {field('telefon', 'Telefon', 'tel', '+49 89 12345678')}
        </div>
      </div>

      <div className="border-t border-mid-gray pt-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Konto erstellen</p>
        <div className="space-y-4">
          {field('email', 'E-Mail-Adresse', 'email', 'ihre@email.de')}
          {field('passwort', 'Passwort', 'password', 'Mindestens 8 Zeichen')}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
        <Button variant="primary" className="flex-1" onClick={handleWeiter}>Weiter →</Button>
      </div>
    </div>
  )
}
