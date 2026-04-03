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
    <div className="animate-fade-up">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-v3-on-surface-v mb-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-v3-secondary" aria-hidden="true" />
            Schritt 3 von 3
          </p>
          <div className="deco-rule mb-3" aria-hidden="true" />
          <h1 className="font-newsreader text-3xl text-v3-on-surface mb-2">
            Zusammenfassung
          </h1>
          <p className="text-v3-on-surface-v text-[15px] leading-relaxed">
            Bitte prüfen Sie Ihre Angaben vor der Absendung.
          </p>
        </div>

        {/* Produkte */}
        <section className="bg-v3-surface rounded-xl p-6 mb-4 border border-v3-outline/50 shadow-sm shadow-v3-outline/20" aria-label="Ihre Produktauswahl">
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ihre Box
          </h2>
          {step1.length === 0 ? (
            <p className="text-v3-on-surface-v text-sm">Keine Produkte ausgewählt.</p>
          ) : (
            <ul className="space-y-2">
              {step1.map(item => (
                <li
                  key={`${item.produkt.id}::${item.menge ?? ''}`}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-v3-primary shrink-0" aria-hidden="true" />
                    <span className="text-v3-on-surface">
                      {item.produkt.name}{item.menge ? ` ${item.menge}` : ''}
                    </span>
                  </span>
                  <span className="text-v3-on-surface-v tabular-nums shrink-0 text-xs">
                    &times;&nbsp;{item.anzahl}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Angaben */}
        <section className="bg-v3-surface rounded-xl p-6 mb-4 border border-v3-outline/50 shadow-sm shadow-v3-outline/20" aria-label="Ihre persönlichen Angaben">
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Angaben
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-v3-on-surface-v">Name</dt>
            <dd className="text-v3-on-surface">{step2.vorname} {step2.nachname}</dd>
            <dt className="text-v3-on-surface-v">Pflegegrad</dt>
            <dd className="text-v3-on-surface">{step2.pflegegrad}</dd>
            <dt className="text-v3-on-surface-v">Krankenkasse</dt>
            <dd className="text-v3-on-surface">{step2.krankenkasse}</dd>
            <dt className="text-v3-on-surface-v">Adresse</dt>
            <dd className="text-v3-on-surface">{step2.strasse} {step2.hausnummer}, {step2.plz} {step2.ort}</dd>
            <dt className="text-v3-on-surface-v">E-Mail</dt>
            <dd className="text-v3-on-surface">{step2.email}</dd>
          </dl>
        </section>

        {/* Liefertag */}
        <section className="bg-v3-surface rounded-xl p-6 mb-4 border border-v3-outline/50 shadow-sm shadow-v3-outline/20" aria-label="Liefertag wählen">
          <h2 className="font-newsreader text-lg text-v3-on-surface mb-1 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 7h12M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Liefertag
          </h2>
          <p className="text-v3-on-surface-v text-sm mb-3">
            An welchem Tag des Monats soll Ihre Box geliefert werden?
          </p>
          <label htmlFor="liefertag" className="sr-only">Liefertag des Monats</label>
          <select
            id="liefertag"
            value={liefertag}
            onChange={e => setLiefertag(Number(e.target.value))}
            className="w-full bg-v3-background border border-v3-outline/60 text-v3-on-surface px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(tag => (
              <option key={tag} value={tag}>{tag}. des Monats</option>
            ))}
          </select>
        </section>

        {/* Konto-Hinweis */}
        <div className="bg-v3-primary-pale/50 rounded-xl p-5 mb-6 border border-v3-primary/20 text-sm text-v3-on-surface-v">
          <p className="flex gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-v3-primary" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 7.5v3M8 5.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Mit Ihrem Velacare-Konto können Sie Ihre Box jederzeit anpassen, Lieferungen pausieren
            und den Status Ihrer Bestellungen verfolgen. Eine Konto-Löschung ist jederzeit möglich.
          </p>
        </div>

        {/* AGB + DSGVO */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agb}
              onChange={e => setAgb(e.target.checked)}
              className="mt-0.5 accent-[#4A7259] w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-v3-on-surface leading-relaxed">
              Ich stimme den{' '}
              <a href="/agb" className="text-v3-primary underline underline-offset-2 hover:text-v3-primary-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary rounded" target="_blank" rel="noreferrer">
                Allgemeinen Geschäftsbedingungen
              </a>{' '}
              zu.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={dsgvo}
              onChange={e => setDsgvo(e.target.checked)}
              className="mt-0.5 accent-[#4A7259] w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-v3-on-surface leading-relaxed">
              Ich habe die{' '}
              <a href="/datenschutz" className="text-v3-primary underline underline-offset-2 hover:text-v3-primary-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary rounded" target="_blank" rel="noreferrer">
                Datenschutzerklärung
              </a>{' '}
              gelesen und stimme der Verarbeitung meiner Daten zu.
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex gap-3 bg-danger-pale text-danger rounded-xl px-4 py-3 text-sm mb-6 border border-danger/20"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 5v3.5M8 10v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onZurueck}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-v3-on-surface-v hover:text-v3-on-surface transition-colors disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2 rounded min-h-[44px] px-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zurück
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className={[
              'ripple-btn min-h-[44px] px-8 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark',
              'shadow-sm shadow-v3-primary/20',
            ].join(' ')}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="20 10"/>
                </svg>
                Wird verarbeitet …
              </span>
            ) : (
              <>
                Jetzt kostenfrei beantragen
                <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
