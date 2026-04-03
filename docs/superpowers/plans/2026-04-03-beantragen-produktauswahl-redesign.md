# Beantragen Step 1 — Produktauswahl Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Step 1 des /beantragen-Funnels auf kategoriebasierte, scrollbare Sektionen mit Stepper-Mengenauswahl, Handschuh-Größenauswahl und Warenkorb-Sidebar umbauen.

**Architecture:** Die gesamte Logik bleibt in `step1-produktauswahl.tsx` — keine neue Datei. `BoxProdukt` bekommt ein neues Pflichtfeld `anzahl: number`. Alle Konsumenten werden minimal angepasst. Drei neue Inline-Subkomponenten: `Stepper`, `ProduktKarteNeu`, `HandschuhKarte`.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS (v3-Tokens), IntersectionObserver (Scroll Reveal), CSS Animations (count-reveal).

**Design Reference:** `wireframes/v3/design.md` — v3-Tokens, Newsreader für Headlines, DM Sans für UI.

---

## Betroffene Dateien

| Aktion | Datei |
|---|---|
| Modify | `src/lib/types.ts` |
| Modify | `src/app/globals.css` |
| Rewrite | `src/app/beantragen/step1-produktauswahl.tsx` |
| Modify | `src/app/beantragen/step3-bestaetigung.tsx` |
| Modify | `src/app/actions/register.ts` |
| Modify | `src/components/box-konfigurator/konfigurator.tsx` |

---

## Task 1: BoxProdukt-Typ erweitern + Konsumenten fixen

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/components/box-konfigurator/konfigurator.tsx`
- Modify: `src/app/actions/register.ts`

- [ ] **Step 1.1: `BoxProdukt` um `anzahl` erweitern**

In `src/lib/types.ts` Zeile 23–26 ersetzen:

```ts
// VORHER
export interface BoxProdukt {
  produkt: Produkt
  menge: string | null
}

// NACHHER
export interface BoxProdukt {
  produkt: Produkt
  menge: string | null   // Größe (z.B. "M") bei Handschuhen, null sonst
  anzahl: number         // Bestellmenge, immer ≥ 1
}
```

- [ ] **Step 1.2: `konfigurator.tsx` — `anzahl: 1` als Default beim Hinzufügen**

In `src/components/box-konfigurator/konfigurator.tsx` die `toggleProdukt`-Funktion anpassen:

```ts
// VORHER (Zeile 26):
return [...prev, { produkt, menge }]

// NACHHER:
return [...prev, { produkt, menge, anzahl: 1 }]
```

- [ ] **Step 1.3: `register.ts` — Gesamtpreis mit `anzahl` multiplizieren**

In `src/app/actions/register.ts` Zeile 61 anpassen:

```ts
// VORHER:
const gesamtpreis = produkte.reduce((sum, item) => sum + Number(item.produkt.preis), 0)

// NACHHER:
const gesamtpreis = produkte.reduce((sum, item) => sum + Number(item.produkt.preis) * item.anzahl, 0)
```

- [ ] **Step 1.4: Build-Check**

```bash
npm run build
```

Erwartetes Ergebnis: `✓ Compiled successfully` (TypeScript-Fehler durch fehlende `anzahl`-Felder würden jetzt erscheinen — im nächsten Task beheben wir `step1`).

- [ ] **Step 1.5: Commit**

```bash
git add src/lib/types.ts src/components/box-konfigurator/konfigurator.tsx src/app/actions/register.ts
git commit -m "feat: BoxProdukt um anzahl-Feld erweitern, Konsumenten anpassen"
```

---

## Task 2: CSS-Animation für Stepper-Zahlen

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 2.1: `count-reveal`-Keyframe nach dem `velacare-hero-float`-Block einfügen**

In `src/app/globals.css` nach Zeile 30 (Ende des `@keyframes velacare-hero-float`-Blocks) einfügen:

```css
/* Stepper number reveal — v3 design.md §5 Produkt-Counter */
@keyframes velacare-count-reveal {
  from { opacity: 0; transform: translateY(6px) scale(0.8); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.count-reveal {
  animation: velacare-count-reveal 0.45s ease both;
}
```

Die bestehende `@media (prefers-reduced-motion)` am Ende der Datei deckt `.count-reveal` automatisch ab.

- [ ] **Step 2.2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: count-reveal Animation für Stepper-Zahlen"
```

---

## Task 3: `step1-produktauswahl.tsx` neu schreiben

**Files:**
- Rewrite: `src/app/beantragen/step1-produktauswahl.tsx`

- [ ] **Step 3.1: Datei vollständig ersetzen**

Dateiinhalt von `src/app/beantragen/step1-produktauswahl.tsx` komplett ersetzen:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { BudgetAnzeige } from '@/components/box-konfigurator/budget-anzeige'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

// ── Konstanten ────────────────────────────────────────────────────────────────

const KATEGORIEN_GEORDNET: ProduktKategorie[] = [
  'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges',
]

type KategorieStil = { bg: string; accent: string; badgeBg: string; badgeText: string }

const KATEGORIE_STIL: Record<ProduktKategorie, KategorieStil> = {
  Handschuhe:     { bg: 'bg-[#EEF4F1]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Desinfektion:   { bg: 'bg-[#F5EDE5]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
  Mundschutz:     { bg: 'bg-[#EEF4F1]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Schutzkleidung: { bg: 'bg-[#F5EDE5]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
  Hygiene:        { bg: 'bg-[#EEF4F1]', accent: 'bg-v3-primary',   badgeBg: 'bg-v3-primary-pale',   badgeText: 'text-v3-primary' },
  Sonstiges:      { bg: 'bg-[#F5EDE5]', accent: 'bg-v3-secondary', badgeBg: 'bg-v3-secondary-pale', badgeText: 'text-v3-secondary' },
}

// ── Hilfsfunktion ─────────────────────────────────────────────────────────────

/** Eindeutiger Warenkorb-Schlüssel: Produkt-ID + optionale Größe */
function boxKey(produkt: Produkt, menge: string | null): string {
  return `${produkt.id}::${menge ?? ''}`
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  anzahl,
  onDecrement,
  onIncrement,
  incrementDisabled,
}: {
  anzahl: number
  onDecrement: () => void
  onIncrement: () => void
  incrementDisabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={anzahl === 0}
        aria-label="Anzahl verringern"
        className={[
          'ripple-btn w-[30px] h-[30px] rounded-full border-[1.5px] flex items-center justify-center',
          'transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
          'border-v3-outline text-v3-on-surface-v',
          'hover:border-v3-primary hover:bg-v3-primary-pale hover:text-v3-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
          <path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <span
        key={anzahl}
        className="count-reveal w-6 text-center text-sm font-semibold tabular-nums text-v3-on-surface"
        aria-live="polite"
        aria-atomic="true"
      >
        {anzahl}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={incrementDisabled}
        aria-label="Anzahl erhöhen"
        className={[
          'ripple-btn w-[30px] h-[30px] rounded-full border-[1.5px] flex items-center justify-center',
          'transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
          'border-v3-outline text-v3-on-surface-v',
          'hover:border-v3-primary hover:bg-v3-primary-pale hover:text-v3-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ── Reguläre Produktkarte ─────────────────────────────────────────────────────

function ProduktKarteNeu({
  produkt,
  box,
  gesamtProzent,
  onSetAnzahl,
  animIdx,
}: {
  produkt: Produkt
  box: BoxProdukt[]
  gesamtProzent: number
  onSetAnzahl: (p: Produkt, m: string | null, delta: number) => void
  animIdx: number
}) {
  const item     = box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, null))
  const anzahl   = item?.anzahl ?? 0
  const selected = anzahl > 0
  const incrementDisabled = gesamtProzent + produkt.maxBudgetProzent > 100 && anzahl === 0

  return (
    <div
      style={{ animationDelay: `${animIdx * 40}ms` }}
      className={[
        'rounded-xl border p-4 transition-all duration-200 card-lift',
        selected
          ? 'bg-v3-primary-pale border-v3-primary border-2'
          : incrementDisabled
          ? 'bg-v3-outline/10 border-v3-outline/20 opacity-50'
          : 'bg-v3-surface border-v3-outline/30 hover:border-v3-primary/40 hover:bg-v3-primary-pale/20',
      ].join(' ')}
    >
      <p className={['font-medium text-sm mb-1 pr-2', selected ? 'text-v3-primary' : 'text-v3-on-surface'].join(' ')}>
        {produkt.name}
      </p>
      {produkt.beschreibung && (
        <p className="text-xs text-v3-on-surface-v leading-relaxed mb-3">{produkt.beschreibung}</p>
      )}
      <div className="flex justify-end">
        <Stepper
          anzahl={anzahl}
          onDecrement={() => onSetAnzahl(produkt, null, -1)}
          onIncrement={() => onSetAnzahl(produkt, null, +1)}
          incrementDisabled={incrementDisabled}
        />
      </div>
    </div>
  )
}

// ── Handschuh-Karte (Größen + Anzahl) ────────────────────────────────────────

function HandschuhKarte({
  produkt,
  box,
  gesamtProzent,
  onSetAnzahl,
  animIdx,
}: {
  produkt: Produkt
  box: BoxProdukt[]
  gesamtProzent: number
  onSetAnzahl: (p: Produkt, m: string | null, delta: number) => void
  animIdx: number
}) {
  const größen     = produkt.mengenOptionen ?? []
  const anySelected = größen.some(g => (box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, g))?.anzahl ?? 0) > 0)

  return (
    <div
      style={{ animationDelay: `${animIdx * 40}ms` }}
      className={[
        'rounded-xl border p-4 transition-all duration-200 card-lift sm:col-span-2',
        anySelected
          ? 'bg-v3-primary-pale border-v3-primary border-2'
          : 'bg-v3-surface border-v3-outline/30 hover:border-v3-primary/40 hover:bg-v3-primary-pale/20',
      ].join(' ')}
    >
      <p className={['font-medium text-sm mb-1', anySelected ? 'text-v3-primary' : 'text-v3-on-surface'].join(' ')}>
        {produkt.name}
      </p>
      {produkt.beschreibung && (
        <p className="text-xs text-v3-on-surface-v leading-relaxed mb-3">{produkt.beschreibung}</p>
      )}
      <div className="space-y-2.5">
        {größen.map(größe => {
          const item    = box.find(b => boxKey(b.produkt, b.menge) === boxKey(produkt, größe))
          const anzahl  = item?.anzahl ?? 0
          // + disabled wenn Budget voll UND diese Größe noch nicht im Warenkorb
          const incrementDisabled = gesamtProzent + produkt.maxBudgetProzent > 100 && anzahl === 0
          return (
            <div key={größe} className="flex items-center justify-between gap-3">
              <span className={[
                'text-xs font-medium px-2.5 py-1 rounded border transition-colors',
                anzahl > 0
                  ? 'bg-v3-primary text-white border-v3-primary'
                  : 'border-v3-outline text-v3-on-surface-v bg-transparent',
              ].join(' ')}>
                {größe}
              </span>
              <Stepper
                anzahl={anzahl}
                onDecrement={() => onSetAnzahl(produkt, größe, -1)}
                onIncrement={() => onSetAnzahl(produkt, größe, +1)}
                incrementDisabled={incrementDisabled}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────

interface Step1Props {
  produkte: Produkt[]
  onWeiter: (produkte: BoxProdukt[]) => void
}

export function Step1Produktauswahl({ produkte, onWeiter }: Step1Props) {
  const [box, setBox] = useState<BoxProdukt[]>([])

  const gesamtProzent = box.reduce((sum, item) => sum + item.produkt.maxBudgetProzent * item.anzahl, 0)
  const gesamtArtikel = box.reduce((sum, item) => sum + item.anzahl, 0)

  // Scroll Reveal für Kategorie-Sektionen
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.kategorie-sektion').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [produkte])

  const setAnzahl = (produkt: Produkt, menge: string | null, delta: number) => {
    const key = boxKey(produkt, menge)
    setBox(prev => {
      const existing = prev.find(b => boxKey(b.produkt, b.menge) === key)
      if (!existing) {
        if (delta <= 0) return prev
        // Budget-Check: +1 würde überschreiten?
        if (gesamtProzent + produkt.maxBudgetProzent > 100) return prev
        return [...prev, { produkt, menge, anzahl: 1 }]
      }
      const neueAnzahl = existing.anzahl + delta
      if (neueAnzahl <= 0) return prev.filter(b => boxKey(b.produkt, b.menge) !== key)
      // Budget-Check für Erhöhung
      if (delta > 0 && gesamtProzent + produkt.maxBudgetProzent > 100) return prev
      return prev.map(b => boxKey(b.produkt, b.menge) === key ? { ...b, anzahl: neueAnzahl } : b)
    })
  }

  const removeItem = (produkt: Produkt, menge: string | null) => {
    setBox(prev => prev.filter(b => boxKey(b.produkt, b.menge) !== boxKey(produkt, menge)))
  }

  // Produkte nach Kategorien gruppieren, leere Kategorien ausblenden
  const gruppen = KATEGORIEN_GEORDNET
    .map(kat => ({ kat, prod: produkte.filter(p => p.kategorie === kat) }))
    .filter(g => g.prod.length > 0)

  return (
    <div className="animate-fade-up">
      <div className="max-w-5xl mx-auto px-4 py-8 md:flex md:gap-8 md:items-start">

        {/* ── Linke Spalte ── */}
        <div className="flex-1 min-w-0">

          {/* Heading */}
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-v3-on-surface-v mb-3 flex items-center gap-2">
              <span className="eyebrow-dot inline-block w-1.5 h-1.5 rounded-full bg-v3-secondary" aria-hidden="true" />
              Schritt 1 von 3
            </p>
            <div className="deco-rule mb-3" aria-hidden="true" />
            <h1 className="font-newsreader text-3xl text-v3-on-surface mb-2">
              Ihre Pflegehilfsmittel
            </h1>
            <p className="text-v3-on-surface-v text-[15px] leading-relaxed max-w-xl">
              Stellen Sie Ihre persönliche Box zusammen. Alle Produkte sind für Sie
              <strong className="text-v3-primary font-medium"> vollständig kostenlos</strong> — finanziert durch Ihre Pflegekasse.
            </p>
          </div>

          {/* Mobile Budget-Ring */}
          <div
            className="md:hidden mb-6 bg-v3-surface rounded-xl border border-v3-outline/25 p-4"
            role="region"
            aria-label="Pflegekasse-Budget"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={gesamtProzent} size="sm" />
          </div>

          {/* Kategorie-Sektionen */}
          {gruppen.map(({ kat, prod }) => {
            const stil = KATEGORIE_STIL[kat]
            return (
              <section
                key={kat}
                className={`kategorie-sektion reveal rounded-2xl p-5 mb-5 ${stil.bg}`}
                aria-label={kat}
              >
                {/* Sektions-Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full ${stil.accent} shrink-0`} aria-hidden="true" />
                  <h2 className="font-newsreader text-xl text-v3-on-surface">{kat}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stil.badgeBg} ${stil.badgeText}`}>
                    {prod.length} Produkt{prod.length !== 1 ? 'e' : ''}
                  </span>
                </div>

                {/* Produkt-Grid */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {prod.map((produkt, idx) =>
                    produkt.mengenOptionen && produkt.mengenOptionen.length > 0 ? (
                      <HandschuhKarte
                        key={produkt.id}
                        produkt={produkt}
                        box={box}
                        gesamtProzent={gesamtProzent}
                        onSetAnzahl={setAnzahl}
                        animIdx={idx}
                      />
                    ) : (
                      <ProduktKarteNeu
                        key={produkt.id}
                        produkt={produkt}
                        box={box}
                        gesamtProzent={gesamtProzent}
                        onSetAnzahl={setAnzahl}
                        animIdx={idx}
                      />
                    )
                  )}
                </div>
              </section>
            )
          })}

          {/* Mobile CTA */}
          <div className="md:hidden mt-4 flex flex-col gap-3">
            {box.length > 0 && (
              <p className="text-sm text-v3-on-surface-v text-center">
                <span className="font-semibold text-v3-on-surface">{box.length} Produkt{box.length !== 1 ? 'e' : ''}</span>
                {', '}
                <span className="font-semibold text-v3-on-surface">{gesamtArtikel} Artikel</span> ausgewählt
              </p>
            )}
            <button
              type="button"
              onClick={() => onWeiter(box)}
              disabled={box.length === 0}
              className={[
                'ripple-btn w-full min-h-[44px] px-6 py-3 rounded-xl font-medium text-sm',
                'transition-all duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark',
                'shadow-sm shadow-v3-primary/20',
              ].join(' ')}
            >
              Weiter
              <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Rechte Sidebar (nur Desktop) ── */}
        <aside
          className="hidden md:flex md:flex-col md:w-64 md:shrink-0 sticky top-[132px] gap-4"
          aria-label="Budget und Ihre Auswahl"
        >
          {/* Budget-Ring */}
          <div className="bg-v3-surface rounded-xl border border-v3-outline/25 p-5 flex flex-col items-center">
            <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-4 self-start">
              Pflegekasse-Budget
            </p>
            <BudgetAnzeige genutztProzent={gesamtProzent} size="md" />
          </div>

          {/* Warenkorb */}
          {box.length > 0 && (
            <div className="bg-v3-surface rounded-xl border border-v3-outline/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-v3-on-surface-v mb-3">
                Ihre Auswahl{' '}
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-v3-primary text-white text-[10px] font-bold">
                  {box.length}
                </span>
              </p>
              <ul className="space-y-2" role="list">
                {box.map(item => (
                  <li
                    key={boxKey(item.produkt, item.menge)}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-v3-on-surface leading-relaxed flex-1">
                      {item.produkt.name}{item.menge ? ` ${item.menge}` : ''}
                    </span>
                    <span className="text-v3-on-surface font-medium tabular-nums shrink-0">
                      &times;&nbsp;{item.anzahl}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.produkt, item.menge)}
                      aria-label={`${item.produkt.name}${item.menge ? ` ${item.menge}` : ''} entfernen`}
                      className="text-v3-on-surface-v hover:text-v3-secondary transition-colors shrink-0 cursor-pointer p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-v3-outline/20 text-xs text-v3-on-surface-v">
                {gesamtArtikel} Artikel gesamt
              </div>
            </div>
          )}

          {/* Desktop CTA */}
          <button
            type="button"
            onClick={() => onWeiter(box)}
            disabled={box.length === 0}
            className={[
              'ripple-btn w-full min-h-[44px] px-6 py-3 rounded-xl font-medium text-sm',
              'transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark',
              'shadow-sm shadow-v3-primary/20',
            ].join(' ')}
          >
            Weiter zu Ihren Daten
            <svg className="inline ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="text-center text-[11px] text-v3-on-surface-v/70 leading-relaxed px-1">
            Vollständig kostenlos — finanziert durch Ihre Pflegekasse gemäß §40 SGB XI
          </p>
        </aside>

      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: Build-Check**

```bash
npm run build
```

Erwartetes Ergebnis: `✓ Compiled successfully`

- [ ] **Step 3.3: Manuell im Browser prüfen**

```bash
npm run dev
```

Öffnen: `http://localhost:3001/beantragen`

Checkliste:
- [ ] Kategoriesektionen erscheinen übereinander (kein Filter-Tab mehr)
- [ ] Grüne Sektionen (#EEF4F1) und Terrakotta-Sektionen (#F5EDE5) wechseln sich ab
- [ ] Jede Sektion hat linken Akzentstreifen + Newsreader-Überschrift + Badge
- [ ] Sektionen revealen beim Scrollen (FadeUp)
- [ ] `+`-Button erscheint, Klick erhöht Zahl um 1 mit Animation
- [ ] `–`-Button bei 0 deaktiviert
- [ ] Bei Handschuhen: pro Größe eine Zeile mit eigenem Stepper
- [ ] Sidebar zeigt Warenkorb (Name + Größe + × Anzahl + × Entfernen)
- [ ] Kein % und kein Preis in der Auswahl-Sidebar
- [ ] Budget-Ring (oben in Sidebar) füllt sich korrekt
- [ ] `+` wird deaktiviert wenn Budget voll

- [ ] **Step 3.4: Commit**

```bash
git add src/app/beantragen/step1-produktauswahl.tsx
git commit -m "feat: Step 1 Produktauswahl — kategorisierte Sektionen, Stepper, Handschuh-Größen, Warenkorb-Sidebar"
```

---

## Task 4: `step3-bestaetigung.tsx` — Anzahl anzeigen + Key fixen

**Files:**
- Modify: `src/app/beantragen/step3-bestaetigung.tsx`

Im aktuellen Code Zeile 60–71 (Produktliste in der Bestätigung) ersetzen:

- [ ] **Step 4.1: Produktliste in Step 3 aktualisieren**

```tsx
// VORHER (Zeile 60–71):
{step1.length === 0 ? (
  <p className="text-v3-on-surface-v text-sm">Keine Produkte ausgewählt.</p>
) : (
  <ul className="space-y-2">
    {step1.map(item => (
      <li key={item.produkt.id} className="flex items-center text-sm gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-v3-primary shrink-0" aria-hidden="true" />
        <span className="text-v3-on-surface">{item.produkt.name}</span>
      </li>
    ))}
  </ul>
)}

// NACHHER:
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
```

- [ ] **Step 4.2: Build-Check + kurze Sichtprüfung**

```bash
npm run build
```

Erwartetes Ergebnis: `✓ Compiled successfully`

Im Browser: Funnel bis Step 3 durchlaufen → Produktliste zeigt jetzt `Handschuhe M × 2` etc.

- [ ] **Step 4.3: Commit**

```bash
git add src/app/beantragen/step3-bestaetigung.tsx
git commit -m "feat: Step 3 — Anzahl pro Produkt in Zusammenfassung anzeigen"
```

---

## Task 5: Abschluss-Check & Aufräumen

- [ ] **Step 5.1: Finaler Build**

```bash
npm run build
```

Erwartetes Ergebnis: `✓ Compiled successfully`

- [ ] **Step 5.2: Vollständigen Funnel testen**

Im Browser (`http://localhost:3001/beantragen`):

1. Step 1: Produkte aus verschiedenen Kategorien wählen, Anzahl erhöhen/senken, Handschuh-Größen wählen
2. Warenkorb-Sidebar prüfen: kein %, kein Preis, Entfernen-Button funktioniert
3. Budget-Ring füllt sich korrekt (2× Produkt = 2× Budget)
4. Step 2 aufrufen → Step 3 → Produktliste zeigt Anzahl korrekt
5. `/konto/meine-box` aufrufen (falls DB verfügbar) → Konfigurator funktioniert noch

- [ ] **Step 5.3: Lint prüfen**

```bash
npm run lint
```

Erwartet: keine Fehler (Warnungen sind OK).

---

## Spec-Abdeckung Selbstcheck

| Spec-Anforderung | Task |
|---|---|
| Produkte nach Kategorien gruppiert | Task 3 (scrollbare Sektionen) |
| Farblich differenzierte Kategorien | Task 3 (`KATEGORIE_STIL`) |
| Größenauswahl Handschuhe | Task 3 (`HandschuhKarte`) |
| Mengenauswahl alle Produkte | Task 3 (`Stepper`) |
| Budget-Constraint 42€ / 100% | Task 3 (`setAnzahl` Budget-Check) |
| „Ihre Auswahl" ohne % | Task 3 (Warenkorb-Sidebar) |
| „Ihre Auswahl" ohne Preise | Task 3 (kein Preis im JSX) |
| Warenkorb-Stil (× Anzahl) | Task 3 |
| Scroll Reveal Animation | Task 3 (`IntersectionObserver`) |
| Count Reveal Animation | Task 2 + Task 3 (`key={anzahl}`) |
| Ripple auf Buttons | Task 3 (`ripple-btn`) |
| Card Hover Lift | Task 3 (`card-lift`) |
| Step 3 zeigt Anzahl | Task 4 |
| `BoxProdukt.anzahl` korrekt | Task 1 |
| `register.ts` multipliziert Preis × Anzahl | Task 1 |
| v3 Design-Tokens (Newsreader, DM Sans, Farben) | Task 3 |
