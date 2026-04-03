# Spec: /beantragen Step 1 — Produktauswahl Redesign

**Datum:** 2026-04-03  
**Status:** Bereit zur Implementierung  
**Betroffene Dateien:** `src/app/beantragen/step1-produktauswahl.tsx`, `src/lib/types.ts`

---

## Ziel

Step 1 des Beantragen-Funnels erhält eine neue Produktdarstellung:
- Produkte nach Kategorien gruppiert (scrollbare Sektionen, keine Filter-Tabs)
- Farblich differenzierte Kategorieheader (v3 Design System)
- Mengenauswahl (Stepper) für alle Produkte
- Größen- UND Mengenauswahl für Handschuhe (mehrere Größen gleichzeitig möglich)
- „Ihre Auswahl"-Sidebar als Warenkorb (keine %, keine Preise)

---

## 1. Layout & Kategoriesektionen

### Struktur

Die bisherigen Filter-Tabs (Alle / Handschuhe / Desinfektion / …) entfallen. Stattdessen werden alle aktiven Kategorien als scrollbare Sektionen übereinander dargestellt — wie ein Produktkatalog.

Die 2-spaltige Desktop-Aufteilung (linke Spalte + rechte Sidebar) bleibt erhalten.

### Kategoriefarben (v3-Tokens)

Kategorien wechseln zwischen zwei Sektionshintergründen ab:

| Kategorie       | Hintergrund             | Akzentfarbe           |
|----------------|-------------------------|-----------------------|
| Handschuhe      | `section-warm` #EEF4F1 | `primary` #4A7259     |
| Desinfektion    | `section-terra` #F5EDE5 | `secondary` #9E5A35  |
| Mundschutz      | `section-warm` #EEF4F1  | `primary` #4A7259    |
| Schutzkleidung  | `section-terra` #F5EDE5 | `secondary` #9E5A35  |
| Hygiene         | `section-warm` #EEF4F1  | `primary` #4A7259    |
| Sonstiges       | `section-terra` #F5EDE5 | `secondary` #9E5A35  |

### Sektions-Header

Jeder Kategorie-Block hat einen Header bestehend aus:
- 4px breiter vertikaler Akzentstreifen links (`primary` oder `secondary`)
- Kategoriename in **Newsreader**, ~`text-xl`
- Badge mit Produktanzahl der Kategorie (z.B. „3 Produkte") in `primary-pale` / `secondary-pale`

Kategorien ohne aktive Produkte werden vollständig ausgeblendet.

---

## 2. Produktkarten

### Reguläre Produkte (alle außer Handschuhe)

Karte zeigt:
- Produktname (`font-medium`, `on-surface`)
- Beschreibung (`text-xs`, `on-surface-variant`)
- Unten: `+`/`–` Stepper

**Stepper-Verhalten:**
- Runde Buttons, 30×30px, `border: 1.5px solid outline`, `border-radius: full`
- Hover: `border-color: primary`, `background: primary-pale`
- Startzustand: Anzahl = 0, `–` deaktiviert
- Bei Anzahl ≥ 1: Karte erhält `primary`-Rahmen + `primary-pale` Hintergrund
- `+` wird deaktiviert, wenn `(aktuelleGesamtprozent + produkt.maxBudgetProzent) > 100`

### Handschuhe (Produkte mit `mengenOptionen`)

Karte zeigt zuerst Größen-Pills (S / M / L / XL — aus `produkt.mengenOptionen`).  
Für **jede Größe** gibt es einen eigenen Stepper:

```
[ S ]  –  0  +
[ M ]  –  2  +   ← grün hervorgehoben (anzahl ≥ 1)
[ L ]  –  1  +   ← grün hervorgehoben
[XL ]  –  0  +
```

- Jede Größe mit `anzahl ≥ 1` ist ein eigenständiger `BoxProdukt`-Eintrag im Warenkorb
- Budget: jede Einheit (egal welche Größe) verbraucht `produkt.maxBudgetProzent`
- `+` einer Größe wird deaktiviert, wenn das Gesamtbudget voll wäre

---

## 3. Datenmodell

### Änderung in `src/lib/types.ts`

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

**Eindeutiger Schlüssel** im Warenkorb: `produkt.id + (menge ?? '')` — ermöglicht mehrere Größen desselben Produkts als separate Einträge.

**Budgetberechnung:**
```ts
const gesamtProzent = box.reduce(
  (sum, item) => sum + item.produkt.maxBudgetProzent * item.anzahl,
  0
)
```

### Kompatibilität

- `konfigurator.tsx` (in `/konto/meine-box`) verwendet `BoxProdukt` ebenfalls — dort muss `anzahl` ebenfalls ergänzt werden (Defaultwert `1` für bestehende Daten)
- `step3-bestaetigung.tsx` zeigt die Auswahl zur Bestätigung — dort ebenfalls `anzahl` anzeigen

---

## 4. Sidebar „Ihre Auswahl" (Warenkorb)

### Desktop (sticky rechte Sidebar)

**Budget-Ring** (`BudgetAnzeige`) bleibt oben — unverändert, zeigt % verbleibend.

**„Ihre Auswahl"-Karte** darunter:

```
Ihre Auswahl  [3]              ← Badge: Anzahl der Zeilen (nicht Artikel)

Handschuhe M         × 2  [×]
Handschuhe L         × 1  [×]
Mundschutz           × 1  [×]
────────────────────────────
5 Artikel gesamt
```

- Jede Zeile: Produktname + Größe (falls vorhanden) + `× anzahl` + `×` Entfernen-Button
- Fußzeile: Summe aller `anzahl` als „N Artikel gesamt"
- **Kein Preis, kein %, kein Prozent-Gesamt**

### Mobile

Kompakte Variante unterhalb des letzten Kategorie-Blocks:
- Einzeilige Zusammenfassung: „3 Produkte, 5 Artikel ausgewählt"
- Danach CTA-Button „Weiter"

---

## 5. CTA-Buttons

Unverändert:
- Desktop: „Weiter zu Ihren Daten →" in der rechten Sidebar, deaktiviert wenn `box.length === 0`
- Mobile: „Weiter →" am Ende der Seite

---

## 6. Nicht verändert

- `step2-daten.tsx` — keine Änderungen
- `step3-bestaetigung.tsx` — nur `anzahl` anzeigen (kleines Update)
- `BudgetAnzeige`-Komponente — bleibt identisch
- Preise werden **nirgends** im Kunden-Frontend angezeigt

---

## 7. Scope-Abgrenzung

Diese Spec betrifft ausschließlich `step1-produktauswahl.tsx` und `src/lib/types.ts` (+ minimale Folgeänderungen in `step3-bestaetigung.tsx` und `konfigurator.tsx`). Keine Änderungen an Backend, DAL, Prisma-Schema oder Admin-Seiten.
