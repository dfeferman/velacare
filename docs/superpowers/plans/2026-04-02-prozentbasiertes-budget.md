# Prozentbasiertes Budget — Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preise verschwinden komplett aus der Kundenoberfläche. Das Budget-Widget und alle Berechnungen im `/beantragen`-Funnel und im Kunden-Konfigurator arbeiten ausschließlich mit `maxBudgetProzent` (0–100). Das Backend (DB, Admin) behält `preis` unverändert.

**Architecture:** `maxBudgetProzent` wird in der DAL-Schicht aus `preis` abgeleitet (`Math.round(preis / 42 * 100)`). Keine DB-Migration nötig. Das Feld `preis` bleibt im `Produkt`-Type erhalten, wird aber nie an den Kunden ausgegeben. `BudgetAnzeige` bekommt einen neuen Prop `genutztProzent: number` statt `genutzt: number`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma (PostgreSQL), Tailwind CSS (v3 tokens)

**Betroffene Dateien:**

| Datei | Änderung |
|---|---|
| `src/lib/types.ts` | `Produkt` Interface: `maxBudgetProzent: number` hinzufügen |
| `src/lib/dal/produkte.ts` | `mapProdukt()`: `maxBudgetProzent` ableiten |
| `src/components/box-konfigurator/budget-anzeige.tsx` | Prop → `genutztProzent`, Anzeige → `%` |
| `src/app/beantragen/step1-produktauswahl.tsx` | Rechnung → `maxBudgetProzent`, Preise entfernen |
| `src/app/beantragen/step3-bestaetigung.tsx` | Preise aus Produktliste entfernen |
| `src/components/box-konfigurator/konfigurator.tsx` | Rechnung → `maxBudgetProzent`, `BudgetAnzeige` updaten |
| `src/components/box-konfigurator/produkt-karte.tsx` | Preisanzeige entfernen |
| `src/app/produkte/produkte-public-content.tsx` | `gesamtwert` (€) → `gesamtProzent` (%), Preise entfernen |

**Unverändert (Admin behält Preise):**
- `src/app/admin/produkte/produkte-client.tsx`
- `src/app/admin/lieferungen/page.tsx`
- `src/app/admin/kunden/[id]/page.tsx`
- `src/app/konto/page.tsx` — zeigt `gesamtwert` nur für interne Referenz, vorerst nicht anfassen
- `src/app/konto/lieferungen/page.tsx` — ebenfalls admin-nah, vorerst nicht anfassen

---

## Task 1: `Produkt` Type + DAL erweitern

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/dal/produkte.ts`

- [ ] **Schritt 1: `maxBudgetProzent` zum `Produkt`-Interface hinzufügen**

In `src/lib/types.ts`, Feld nach `preis` einfügen:

```typescript
export interface Produkt {
  id: string
  name: string
  beschreibung: string
  preis: number           // intern — nie im Frontend anzeigen
  maxBudgetProzent: number // abgeleitet: Math.round(preis / 42 * 100), 0–100
  kategorie: ProduktKategorie
  aktiv: boolean
  bildUrl: string
  mengenOptionen?: string[]
}
```

- [ ] **Schritt 2: `maxBudgetProzent` in `mapProdukt()` berechnen**

In `src/lib/dal/produkte.ts`, die Funktion `mapProdukt()` erweitern:

```typescript
import { BUDGET_LIMIT_EUR } from '@/lib/pflegebudget'

function mapProdukt(raw: { ... }): Produkt {
  const preisNum = typeof raw.preis === 'number' ? raw.preis : raw.preis.toNumber()
  const varianten = raw.varianten as { mengenOptionen?: string[] } | null
  return {
    id:               raw.id,
    name:             raw.name,
    beschreibung:     raw.beschreibung,
    preis:            preisNum,
    maxBudgetProzent: Math.round((preisNum / BUDGET_LIMIT_EUR) * 100),
    kategorie:        mapKategorie(raw.kategorie),
    aktiv:            raw.aktiv,
    bildUrl:          raw.bild_url,
    mengenOptionen:   varianten?.mengenOptionen,
  }
}
```

- [ ] **Schritt 3: TypeScript-Build prüfen**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

Erwartetes Ergebnis: `✓ Compiled successfully` (oder nur Fehler wegen fehlender Stellen, die in späteren Tasks behoben werden)

- [ ] **Schritt 4: Committen**

```bash
git add src/lib/types.ts src/lib/dal/produkte.ts
git commit -m "feat: add maxBudgetProzent derived field to Produkt type and DAL"
```

---

## Task 2: `BudgetAnzeige` auf Prozent umstellen

**Files:**
- Modify: `src/components/box-konfigurator/budget-anzeige.tsx`

Der Ring-Anteil ändert sich minimal (war schon prozentbasiert intern). Die zentrale Änderung: Prop heißt jetzt `genutztProzent` (0–100), die Anzeige zeigt `%` statt `€`.

- [ ] **Schritt 1: Interface und Berechnungslogik ändern**

```typescript
interface BudgetAnzeigeProps {
  genutztProzent: number  // 0–100; war: genutzt (€-Betrag)
  size?: 'sm' | 'md'
}
```

Alle Referenzen auf `BUDGET_LIMIT_EUR` entfernen — kein Import mehr nötig.

```typescript
// Neu — direkt aus dem Prop:
const prozent        = Math.min(genutztProzent, 100)
const verbleibend    = Math.max(100 - genutztProzent, 0)
const ueberschritten = genutztProzent > 100
const dashOffset     = CIRCUMFERENCE * (1 - prozent / 100)
```

- [ ] **Schritt 2: Center-Text (md) auf `%` umstellen**

```tsx
{/* Vorher: {verbleibend.toFixed(2).replace('.', ',')} € */}
<text ...>{verbleibend.toFixed(0)} %</text>
<text ...>verfügbar</text>
```

- [ ] **Schritt 3: Labels (sm + md) auf `%` umstellen**

```tsx
{/* sm mode */}
<p>
  <span style={{ color: ringColor }}>{verbleibend.toFixed(0)} %</span>
  <span className="text-v3-on-surface-v font-normal text-xs"> verfügbar</span>
</p>
<p className="text-xs text-v3-on-surface-v mt-0.5">
  {genutztProzent.toFixed(0)} % von 100 % genutzt
</p>

{/* md mode */}
<p className="text-xs text-v3-on-surface-v tabular-nums">
  <span className="font-medium text-v3-on-surface">{genutztProzent.toFixed(0)} %</span>
  {' '}von 100 % genutzt
</p>
```

- [ ] **Schritt 4: Accessibility-Label aktualisieren**

Im SVG: `aria-label={`${verbleibend.toFixed(0)} Prozent von 100 Prozent verfügbar`}`

- [ ] **Schritt 5: Build prüfen**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

Erwartung: TS-Fehler an allen Aufrufstellen (werden in Task 3 + 4 behoben)

- [ ] **Schritt 6: Committen**

```bash
git add src/components/box-konfigurator/budget-anzeige.tsx
git commit -m "feat: BudgetAnzeige shows % instead of € (prop: genutztProzent)"
```

---

## Task 3: Step 1 Produktauswahl — Prozentrechnung + Preise entfernen

**Files:**
- Modify: `src/app/beantragen/step1-produktauswahl.tsx`

- [ ] **Schritt 1: Budget-Berechnung auf `maxBudgetProzent` umstellen**

```typescript
// Alt:
const verwendetBetrag = gewählt.reduce((s, i) => s + Number(i.produkt.preis), 0)
const restBudget      = BUDGET_LIMIT_EUR - verwendetBetrag

// Neu:
const verwendetProzent = gewählt.reduce((s, i) => s + i.produkt.maxBudgetProzent, 0)
const restProzent      = Math.max(100 - verwendetProzent, 0)
```

Import `BUDGET_LIMIT_EUR` entfernen.

- [ ] **Schritt 2: Toggle-Logik auf Prozent umstellen**

```typescript
const toggle = (produkt: Produkt) => {
  setGewählt(prev => {
    const exists = prev.some(p => p.produkt.id === produkt.id)
    if (exists) return prev.filter(p => p.produkt.id !== produkt.id)
    // Budget-Grenze: verwendetProzent + neues Produkt darf 100 nicht überschreiten
    if (verwendetProzent + produkt.maxBudgetProzent > 100) return prev
    return [...prev, { produkt, menge: null }]
  })
}
```

- [ ] **Schritt 3: `blocked`-Logik in Produkt-Karten aktualisieren**

```typescript
const blocked = !selected && verwendetProzent + produkt.maxBudgetProzent > 100
```

- [ ] **Schritt 4: `BudgetAnzeige`-Aufruf aktualisieren**

```tsx
{/* Mobile */}
<BudgetAnzeige genutztProzent={verwendetProzent} size="sm" />

{/* Desktop Sidebar */}
<BudgetAnzeige genutztProzent={verwendetProzent} size="md" />
```

- [ ] **Schritt 5: Preisanzeige aus Produktkarten entfernen**

```tsx
{/* Entfernen: */}
{Number(produkt.preis) > 0 && (
  <p className={[...].join(' ')}>
    {Number(produkt.preis).toFixed(2).replace('.', ',')} €
  </p>
)}
```

- [ ] **Schritt 6: Preisanzeige aus Desktop-Auswahlliste entfernen**

```tsx
{/* Alt: */}
<span className="text-v3-primary font-medium tabular-nums shrink-0">
  {Number(item.produkt.preis).toFixed(2).replace('.', ',')} €
</span>

{/* Neu: prozentanteil statt preis */}
<span className="text-v3-primary font-medium tabular-nums shrink-0">
  {item.produkt.maxBudgetProzent} %
</span>
```

- [ ] **Schritt 7: Gesamt-Summe in Sidebar auf Prozent umstellen**

```tsx
{/* Alt: */}
<span className="font-semibold text-v3-on-surface tabular-nums">
  {verwendetBetrag.toFixed(2).replace('.', ',')} €
</span>

{/* Neu: */}
<span className="font-semibold text-v3-on-surface tabular-nums">
  {verwendetProzent} %
</span>
```

- [ ] **Schritt 8: Build prüfen**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Schritt 9: Committen**

```bash
git add src/app/beantragen/step1-produktauswahl.tsx
git commit -m "feat: step1 uses maxBudgetProzent for budget logic, removes price display"
```

---

## Task 4: Step 3 Bestätigung — Preise entfernen

**Files:**
- Modify: `src/app/beantragen/step3-bestaetigung.tsx`

- [ ] **Schritt 1: Preis-Spalte aus Produktliste entfernen**

In `step3-bestaetigung.tsx`, Zeilen 70–74:

```tsx
{/* Entfernen: */}
{Number(item.produkt.preis) > 0 && (
  <span className="text-v3-on-surface-v tabular-nums">
    {Number(item.produkt.preis).toFixed(2).replace('.', ',')} €
  </span>
)}
```

Die `<li>` bleibt, zeigt nur noch `item.produkt.name`. Optional: `justify-between` → kein justify nötig wenn kein zweites Element.

- [ ] **Schritt 2: Build prüfen + Committen**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
git add src/app/beantragen/step3-bestaetigung.tsx
git commit -m "feat: step3 removes price display from product list"
```

---

## Task 5: Konfigurator (`/konto`) — Prozentrechnung + Preise entfernen

**Files:**
- Modify: `src/components/box-konfigurator/konfigurator.tsx`
- Modify: `src/components/box-konfigurator/produkt-karte.tsx`

- [ ] **Schritt 1: `konfigurator.tsx` — Berechnung auf Prozent umstellen**

```typescript
// Alt:
const gesamtwert = box.reduce((sum, item) => sum + item.produkt.preis, 0)
const ueberschritten = gesamtwert > BUDGET_LIMIT_EUR

// Neu:
const gesamtProzent  = box.reduce((sum, item) => sum + item.produkt.maxBudgetProzent, 0)
const ueberschritten = gesamtProzent > 100
```

- [ ] **Schritt 2: `BudgetAnzeige` Prop aktualisieren**

```tsx
<BudgetAnzeige genutztProzent={gesamtProzent} />
```

- [ ] **Schritt 3: Budget-Check in `toggleProdukt` aktualisieren**

```typescript
const budgetNachHinzufuegen = gesamtProzent + (ausgewaehlt ? 0 : produkt.maxBudgetProzent)
// weitergeben an ProduktKarte:
budgetWuerdeUeberschritten={budgetNachHinzufuegen > 100}
```

- [ ] **Schritt 4: Preis aus Auswahlliste entfernen**

```tsx
{/* Entfernen: */}
<span className="text-terra font-medium">{item.produkt.preis.toFixed(2)...} €</span>

{/* Optional ersetzen mit: */}
<span className="text-v3-primary font-medium">{item.produkt.maxBudgetProzent} %</span>
```

- [ ] **Schritt 5: `produkt-karte.tsx` — Preisanzeige entfernen**

Zeile 24: Preis-`<span>` entfernen.

- [ ] **Schritt 6: Build + Commit**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
git add src/components/box-konfigurator/konfigurator.tsx \
        src/components/box-konfigurator/produkt-karte.tsx
git commit -m "feat: konfigurator and produkt-karte use maxBudgetProzent, no price display"
```

---

## Task 6: Produkte-Seite (`/produkte`) — Preise + Gesamtbetrag entfernen

**Files:**
- Modify: `src/app/produkte/produkte-public-content.tsx`

- [ ] **Schritt 1: `gesamtwert` → `gesamtProzent`**

```typescript
// Alt:
const gesamtwert = auswahl.reduce((s, p) => s + p.preis, 0)

// Neu:
const gesamtProzent = auswahl.reduce((s, p) => s + p.maxBudgetProzent, 0)
```

- [ ] **Schritt 2: Alle Preisanzeigen durch %-Werte oder nichts ersetzen**

Alle `preis`-Referenzen in diesem File prüfen und entfernen/ersetzen. Kein `€`-Zeichen mehr sichtbar für Kunden.

- [ ] **Schritt 3: Budget-Blockierung aktualisieren (falls vorhanden)**

```typescript
budgetWuerdeUeberschritten={gesamtProzent + produkt.maxBudgetProzent > 100}
```

- [ ] **Schritt 4: Build + Commit**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
git add src/app/produkte/produkte-public-content.tsx
git commit -m "feat: public products page removes prices, uses maxBudgetProzent"
```

---

## Task 7: Final Build-Verifikation

- [ ] **Schritt 1: Vollständiger Build**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled|Failed)"
```

Erwartung: `✓ Compiled successfully`

- [ ] **Schritt 2: Auf `preis` in Customer-Facing-Dateien prüfen (kein Preis-Leak)**

```bash
grep -n "preis" \
  src/app/beantragen/step1-produktauswahl.tsx \
  src/app/beantragen/step3-bestaetigung.tsx \
  src/components/box-konfigurator/budget-anzeige.tsx \
  src/components/box-konfigurator/konfigurator.tsx \
  src/components/box-konfigurator/produkt-karte.tsx \
  src/app/produkte/produkte-public-content.tsx
```

Erwartung: Kein `preis` mehr in diesen Dateien (höchstens in Kommentaren oder `maxBudgetProzent`)

- [ ] **Schritt 3: `€`-Zeichen in Customer-Facing-Dateien prüfen**

```bash
grep -n "€" \
  src/app/beantragen/step1-produktauswahl.tsx \
  src/app/beantragen/step3-bestaetigung.tsx \
  src/components/box-konfigurator/budget-anzeige.tsx \
  src/components/box-konfigurator/konfigurator.tsx \
  src/components/box-konfigurator/produkt-karte.tsx \
  src/app/produkte/produkte-public-content.tsx
```

Erwartung: Kein `€` mehr

- [ ] **Schritt 4: Admin-Preisanzeige unverändert prüfen**

```bash
grep -n "preis" \
  src/app/admin/produkte/produkte-client.tsx \
  src/app/admin/kunden/[id]/page.tsx
```

Erwartung: `preis` in Admin-Dateien vorhanden (unverändert)

- [ ] **Schritt 5: Finales Commit (falls nötig)**

```bash
git add -A
git commit -m "chore: final cleanup after prozentbasiertes-budget migration"
```
