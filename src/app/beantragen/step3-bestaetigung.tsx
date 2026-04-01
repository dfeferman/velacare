'use client'

import { useState, useTransition } from 'react'
import { registerKunde } from '@/app/actions/register'
import type { Step2Data } from '@/lib/schemas/register'
import type { BoxProdukt } from '@/lib/types'

interface Step3Props {
  step1:     BoxProdukt[]
  step2:     Step2Data
  onZurueck: () => void
}

export function Step3Bestaetigung({ step1, step2, onZurueck }: Step3Props) {
  const [liefertag, setLiefertag] = useState<number>(1)
  const [agb, setAgb]             = useState(false)
  const [dsgvo, setDsgvo]         = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canSubmit = agb && dsgvo && !isPending

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await registerKunde(step1, liefertag, step2)
      if (result?.error) setError(result.error)
      // On success: server action calls redirect() — no client code needed
    })
  }

  return (
    <div className="min-h-screen bg-v2-surface font-manrope">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-newsreader text-3xl text-v2-on-surface mb-2">Zusammenfassung</h1>
        <p className="text-v2-on-surface-v mb-8">Bitte prüfen Sie Ihre Angaben vor der Absendung.</p>

        {/* Produkte */}
        <div className="bg-v2-surface-lowest rounded-xl p-6 mb-4">
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-3">Ihre Box</h2>
          {step1.length === 0 ? (
            <p className="text-v2-on-surface-v text-sm">Keine Produkte ausgewählt.</p>
          ) : (
            <ul className="space-y-1">
              {step1.map(item => (
                <li key={item.produkt.id} className="text-sm text-v2-on-surface">
                  {item.produkt.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Angaben */}
        <div className="bg-v2-surface-lowest rounded-xl p-6 mb-4">
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-3">Angaben</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-v2-on-surface-v">Name</dt>
            <dd className="text-v2-on-surface">{step2.vorname} {step2.nachname}</dd>
            <dt className="text-v2-on-surface-v">Pflegegrad</dt>
            <dd className="text-v2-on-surface">{step2.pflegegrad}</dd>
            <dt className="text-v2-on-surface-v">Krankenkasse</dt>
            <dd className="text-v2-on-surface">{step2.krankenkasse}</dd>
            <dt className="text-v2-on-surface-v">Adresse</dt>
            <dd className="text-v2-on-surface">{step2.strasse} {step2.hausnummer}, {step2.plz} {step2.ort}</dd>
            <dt className="text-v2-on-surface-v">E-Mail</dt>
            <dd className="text-v2-on-surface">{step2.email}</dd>
          </dl>
        </div>

        {/* Liefertag */}
        <div className="bg-v2-surface-lowest rounded-xl p-6 mb-4">
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-3">Liefertag</h2>
          <p className="text-v2-on-surface-v text-sm mb-3">
            An welchem Tag des Monats soll Ihre Box geliefert werden?
          </p>
          <select
            value={liefertag}
            onChange={e => setLiefertag(Number(e.target.value))}
            className="w-full bg-v2-surface-low text-v2-on-surface px-3 py-2.5 rounded-t-sm border-0 border-b border-v2-outline-v focus:border-v2-primary focus:outline-none text-sm"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(tag => (
              <option key={tag} value={tag}>{tag}. des Monats</option>
            ))}
          </select>
        </div>

        {/* Konto-Hinweis */}
        <div className="bg-v2-surface-low rounded-xl p-5 mb-6 text-sm text-v2-on-surface-v">
          <p>
            Mit Ihrem Velacare-Konto können Sie Ihre Box jederzeit anpassen, Lieferungen pausieren
            und den Status Ihrer Bestellungen verfolgen. Eine Konto-Löschung ist jederzeit möglich.
          </p>
        </div>

        {/* AGB + DSGVO */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agb} onChange={e => setAgb(e.target.checked)} className="mt-0.5 accent-v2-primary" />
            <span className="text-sm text-v2-on-surface">
              Ich stimme den <a href="/agb" className="text-v2-primary underline" target="_blank" rel="noreferrer">Allgemeinen Geschäftsbedingungen</a> zu.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={dsgvo} onChange={e => setDsgvo(e.target.checked)} className="mt-0.5 accent-v2-primary" />
            <span className="text-sm text-v2-on-surface">
              Ich habe die <a href="/datenschutz" className="text-v2-primary underline" target="_blank" rel="noreferrer">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-v2-error-bg text-v2-error rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={onZurueck}
            disabled={isPending}
            className="px-6 py-3 text-v2-on-surface-v hover:text-v2-on-surface transition-colors text-sm disabled:opacity-40"
          >
            ← Zurück
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium hover:bg-v2-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[220px]"
          >
            {isPending ? 'Wird verarbeitet …' : 'Jetzt kostenfrei beantragen'}
          </button>
        </div>
      </div>
    </div>
  )
}
