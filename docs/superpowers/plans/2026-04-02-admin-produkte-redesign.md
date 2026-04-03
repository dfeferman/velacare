# Admin Produkte-Seite Redesign — Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement task-by-task.

**Goal:** Die Admin-Produktseite bekommt ein vollständiges Formular (Slide-over Panel) zum Anlegen und Bearbeiten von Produkten mit allen Feldern — inkl. Größenvarianten für Handschuhe.

**Architecture:**
- Slide-over Panel (Client Component) öffnet sich rechts beim Klick auf „Neues Produkt" oder „Bearbeiten"
- Server Actions (`createProdukt`, `updateProdukt`) nehmen alle Felder entgegen
- Varianten werden als `{ mengenOptionen: string[] }` im `varianten Json?`-Feld gespeichert
- Größen-Chips (S/M/L/XL) erscheinen nur wenn `kategorie === 'handschuhe'`
- Kein Foto-Upload (bild_url bleibt leer, späteres Feature)

**Tech Stack:** Next.js 15 App Router, Server Actions, Prisma, Tailwind (v3 tokens)

---

## Phase 0: Bestandsaufnahme (bereits erledigt)

**Relevante Dateien:**

| Datei | Rolle |
|---|---|
| `src/app/admin/produkte/page.tsx` | Server Component, lädt Produktliste |
| `src/app/admin/produkte/produkte-client.tsx` | Client UI, CRUD-Operationen |
| `src/app/actions/admin.ts` | Server Actions (createProdukt, toggle, delete) |
| `prisma/schema.prisma:135-150` | Produkt-Model |
| `src/lib/types.ts` | Produkt-Interface |
| `src/lib/dal/admin.ts:150-153` | getAdminProdukte() |

**Bestehende Server-Actions-Signatur (Referenz):**
```typescript
// src/app/actions/admin.ts
export async function createProdukt(): Promise<{ error?: string }>
export async function updateProduktName(id: string, name: string): Promise<{ error?: string }>
export async function toggleProduktAktiv(id: string, aktiv: boolean): Promise<{ error?: string }>
export async function deleteProdukt(id: string): Promise<{ error?: string }>
```

**Bestehende Varianten-Struktur (Referenz):**
```typescript
// src/lib/dal/produkte.ts — mapProdukt()
const varianten = raw.varianten as { mengenOptionen?: string[] } | null
mengenOptionen: varianten?.mengenOptionen
```

**v3 Design-Tokens (Referenz aus CLAUDE.md):**
- Input: `bg-v3-surface border border-v3-outline/60 rounded-lg px-4 py-3`
- Label: `text-xs font-medium text-v3-on-surface-v uppercase tracking-wide`
- Primary Button: `bg-v3-primary text-white rounded-lg hover:bg-v3-primary-mid`

---

## Task 1: Server Actions erweitern

**Files:**
- Modify: `src/app/actions/admin.ts`

Zwei bestehende Actions ersetzen/erweitern, eine neue hinzufügen.

### ProduktFormData-Typ definieren

```typescript
// Oben in admin.ts hinzufügen (kein Export nötig)
interface ProduktFormData {
  name:                string
  kategorie:           'handschuhe' | 'desinfektion' | 'mundschutz' | 'schutzkleidung' | 'hygiene' | 'sonstiges'
  preis:               number
  beschreibung:        string
  hersteller:          string
  pflichtkennzeichnung?: string
  aktiv:               boolean
  sortierung:          number
  mengenOptionen?:     string[]   // nur für handschuhe
}
```

### `createProdukt` ersetzen

```typescript
export async function createProdukt(data: ProduktFormData): Promise<{ error?: string }> {
  const adminUser = await requireAdmin()
  if (!adminUser) return { error: 'Keine Berechtigung.' }

  const neuesProdukt = await prisma.produkt.create({
    data: {
      name:                data.name.trim(),
      kategorie:           data.kategorie,
      preis:               data.preis,
      beschreibung:        data.beschreibung.trim(),
      hersteller:          data.hersteller.trim(),
      pflichtkennzeichnung: data.pflichtkennzeichnung?.trim() ?? null,
      bild_url:            '',
      aktiv:               data.aktiv,
      sortierung:          data.sortierung,
      varianten:           data.mengenOptionen?.length
                             ? { mengenOptionen: data.mengenOptionen }
                             : undefined,
    },
  })

  try {
    await writeAuditLog({
      aktion: 'produkt_erstellt',
      entitaet: 'Produkt',
      entitaet_id: neuesProdukt.id,
      userId: adminUser.id,
      neuWert: neuesProdukt as unknown as object,
    })
  } catch (e) {
    console.error('AuditLog-Write fehlgeschlagen (createProdukt):', e)
  }

  revalidatePath('/admin/produkte')
  return {}
}
```

### `updateProdukt` neu hinzufügen

```typescript
export async function updateProdukt(id: string, data: ProduktFormData): Promise<{ error?: string }> {
  const adminUser = await requireAdmin()
  if (!adminUser) return { error: 'Keine Berechtigung.' }

  const altesProdukt = await prisma.produkt.findUnique({ where: { id } })

  const aktualisiert = await prisma.produkt.update({
    where: { id },
    data: {
      name:                data.name.trim(),
      kategorie:           data.kategorie,
      preis:               data.preis,
      beschreibung:        data.beschreibung.trim(),
      hersteller:          data.hersteller.trim(),
      pflichtkennzeichnung: data.pflichtkennzeichnung?.trim() ?? null,
      aktiv:               data.aktiv,
      sortierung:          data.sortierung,
      varianten:           data.mengenOptionen?.length
                             ? { mengenOptionen: data.mengenOptionen }
                             : null,
    },
  })

  try {
    await writeAuditLog({
      aktion: 'produkt_aktualisiert',
      entitaet: 'Produkt',
      entitaet_id: id,
      userId: adminUser.id,
      altWert: altesProdukt as unknown as object,
      neuWert: aktualisiert as unknown as object,
    })
  } catch (e) {
    console.error('AuditLog-Write fehlgeschlagen (updateProdukt):', e)
  }

  revalidatePath('/admin/produkte')
  return {}
}
```

### `updateProduktName` entfernen (ersetzt durch `updateProdukt`)

- [ ] **Schritt 1:** `ProduktFormData` Interface hinzufügen
- [ ] **Schritt 2:** `createProdukt` mit allen Feldern ersetzen
- [ ] **Schritt 3:** `updateProdukt(id, data)` hinzufügen
- [ ] **Schritt 4:** `updateProduktName` löschen
- [ ] **Schritt 5:** TypeScript prüfen: `npx tsc --noEmit 2>&1 | grep "admin.ts"`
- [ ] **Schritt 6:** Committen: `git commit -m "feat: admin server actions für vollständige Produktbearbeitung"`

---

## Task 2: ProduktPanel Component (Slide-over)

**Files:**
- Create: `src/app/admin/produkte/produkt-panel.tsx`

Neues Client Component: Slide-over Panel das sich von rechts einschiebt. Enthält das vollständige Formular.

### Props-Interface

```typescript
interface ProduktPanelProps {
  offen:       boolean
  onSchliessen: () => void
  produkt?:    ProduktAdminRow | null   // null = Neu-Modus, gefüllt = Edit-Modus
  onErfolgreich: () => void
}
```

### Panel-Struktur

```tsx
{/* Backdrop */}
<div
  className={`fixed inset-0 bg-v3-dark/40 z-40 transition-opacity duration-300 ${offen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
  onClick={onSchliessen}
/>

{/* Panel */}
<aside
  className={`fixed top-0 right-0 h-full w-full max-w-lg bg-v3-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ${offen ? 'translate-x-0' : 'translate-x-full'}`}
  aria-modal="true"
  role="dialog"
  aria-label={produkt ? 'Produkt bearbeiten' : 'Neues Produkt'}
>
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-v3-outline/20">
    <h2 className="font-newsreader text-xl text-v3-on-surface">
      {produkt ? 'Produkt bearbeiten' : 'Neues Produkt'}
    </h2>
    <button onClick={onSchliessen} aria-label="Schließen">
      {/* X-Icon SVG */}
    </button>
  </div>

  {/* Scrollbarer Form-Bereich */}
  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
    {/* Form fields here */}
  </div>

  {/* Footer mit Buttons */}
  <div className="px-6 py-4 border-t border-v3-outline/20 flex justify-end gap-3">
    <button onClick={onSchliessen}>Abbrechen</button>
    <button type="submit">Speichern</button>
  </div>
</aside>
```

### Formular-Felder

| Feld | UI-Element | Hinweis |
|---|---|---|
| `name` | `<input type="text">` | Pflichtfeld |
| `kategorie` | `<select>` | Enum-Werte |
| `preis` | `<input type="number" step="0.01">` | Min 0 |
| `beschreibung` | `<textarea rows={3}>` | Pflichtfeld |
| `hersteller` | `<input type="text">` | Pflichtfeld |
| `pflichtkennzeichnung` | `<textarea rows={2}>` | Optional |
| `sortierung` | `<input type="number">` | Default 0 |
| `aktiv` | `<input type="checkbox">` | Default true |
| `mengenOptionen` | Toggle-Chips S/M/L/XL | **Nur wenn `kategorie === 'handschuhe'`** |

### Größen-Chips (Handschuhe)

```tsx
{form.kategorie === 'handschuhe' && (
  <div>
    <label className={labelBase}>Verfügbare Größen</label>
    <div className="flex gap-2 flex-wrap mt-2">
      {(['S', 'M', 'L', 'XL'] as const).map(gr => {
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
```

### Submit-Handler

```typescript
const handleSubmit = async () => {
  setLoading(true)
  setError(null)
  const result = produkt
    ? await updateProdukt(produkt.id, form)
    : await createProdukt(form)
  setLoading(false)
  if (result.error) {
    setError(result.error)
    return
  }
  onErfolgreich()
  onSchliessen()
}
```

- [ ] **Schritt 1:** Datei `src/app/admin/produkte/produkt-panel.tsx` erstellen
- [ ] **Schritt 2:** Panel-Struktur (Backdrop + Slide-over + Header + Footer)
- [ ] **Schritt 3:** Alle Formular-Felder mit v3-Styling implementieren
- [ ] **Schritt 4:** Größen-Chips für `handschuhe`-Kategorie
- [ ] **Schritt 5:** Submit-Handler mit `createProdukt` / `updateProdukt`
- [ ] **Schritt 6:** `useEffect` für Fokus-Trap und ESC-Schließen
- [ ] **Schritt 7:** TypeScript prüfen: `npx tsc --noEmit 2>&1 | grep "produkt-panel"`
- [ ] **Schritt 8:** Committen

---

## Task 3: Produkte-Liste UI redesign

**Files:**
- Modify: `src/app/admin/produkte/produkte-client.tsx`

Die bestehende Liste komplett ersetzen. Inline-Editing entfernen. Stattdessen: Tabelle/Karten-Grid mit klaren Edit- und Delete-Buttons, „Neues Produkt"-Button oben.

### Neue Datenstruktur für die Liste

```typescript
// Wird von page.tsx übergeben (bereits vorhanden, nur erweitern)
interface ProduktAdminRow {
  id:          string
  name:        string
  kategorie:   string
  preis:       number
  aktiv:       boolean
  sortierung:  number
  beschreibung: string
  hersteller:  string
  pflichtkennzeichnung: string | null
  varianten:   { mengenOptionen?: string[] } | null
}
```

### Neue Listenstruktur

```
┌─────────────────────────────────────────────────────┐
│  Produkte               [+ Neues Produkt]            │
├─────────────────────────────────────────────────────┤
│  NAME            KATEGORIE   PREIS   STATUS   AKTIONEN │
│  Nitrilhandschuhe Handschuhe  4,20€   ● Aktiv  ✏ 🗑  │
│  Mundschutz Typ2  Mundschutz  2,10€   ○ Inaktiv ✏ 🗑  │
└─────────────────────────────────────────────────────┘
```

### State-Management

```typescript
const [panelOffen, setPanelOffen]   = useState(false)
const [editProdukt, setEditProdukt] = useState<ProduktAdminRow | null>(null)

const neuesProdukt = () => {
  setEditProdukt(null)
  setPanelOffen(true)
}

const bearbeiten = (p: ProduktAdminRow) => {
  setEditProdukt(p)
  setPanelOffen(true)
}
```

### page.tsx: Datenabfrage erweitern

`getAdminProdukte()` muss alle neuen Felder zurückgeben. Falls nötig, DAL anpassen.

- [ ] **Schritt 1:** `src/app/admin/produkte/page.tsx` — `getAdminProdukte()` prüfen, alle Felder included
- [ ] **Schritt 2:** `produkte-client.tsx` komplett neu schreiben:
  - Header mit „Neues Produkt"-Button
  - Tabelle mit allen relevanten Spalten
  - Edit-Button pro Zeile → `setEditProdukt(p); setPanelOffen(true)`
  - Delete-Button mit Bestätigung (bestehende `deleteProdukt` Action)
  - `toggleProduktAktiv` per Status-Toggle in der Tabelle
- [ ] **Schritt 3:** `ProduktPanel` importieren und einbinden
- [ ] **Schritt 4:** TypeScript prüfen
- [ ] **Schritt 5:** Committen: `git commit -m "feat: admin produkte-liste redesign mit slide-over panel"`

---

## Task 4: page.tsx DAL-Anpassung

**Files:**
- Modify: `src/app/admin/produkte/page.tsx`
- Modify: `src/lib/dal/admin.ts` (falls `getAdminProdukte` Felder fehlen)

Sicherstellen dass `getAdminProdukte()` alle für den Admin benötigten Felder liefert.

```typescript
// In dal/admin.ts prüfen:
export async function getAdminProdukte() {
  return prisma.produkt.findMany({
    orderBy: [{ sortierung: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      kategorie: true,
      preis: true,
      beschreibung: true,
      hersteller: true,
      pflichtkennzeichnung: true,
      bild_url: true,
      aktiv: true,
      sortierung: true,
      varianten: true,
      erstellt_am: true,
    }
  })
}
```

- [ ] **Schritt 1:** `getAdminProdukte()` in `dal/admin.ts` auf vollständiges Select erweitern
- [ ] **Schritt 2:** `page.tsx` — Props an `ProdukteClient` weitergeben
- [ ] **Schritt 3:** TypeScript prüfen: `npx tsc --noEmit 2>&1 | grep -E "(admin/produkte|dal/admin)"`
- [ ] **Schritt 4:** Committen

---

## Task 5: Final Verifikation

- [ ] **Build prüfen:**
  ```bash
  npm run build 2>&1 | tail -15
  ```

- [ ] **Keine alten Referenzen auf `updateProduktName`:**
  ```bash
  grep -r "updateProduktName" src/
  ```
  Erwartung: keine Treffer

- [ ] **Varianten-Struktur korrekt:**
  ```bash
  grep -n "mengenOptionen" src/app/admin/produkte/produkt-panel.tsx
  ```
  Erwartung: `mengenOptionen` in Toggle-Chip-Logik vorhanden

- [ ] **v3-Tokens überall (kein hardcodiertes Hex im Panel):**
  ```bash
  grep -n "#4A7259\|#FAF6EF" src/app/admin/produkte/produkt-panel.tsx
  ```
  Erwartung: keine hardcodierten Farben

- [ ] **Finaler Commit:**
  ```bash
  git commit -m "chore: admin produkte redesign abgeschlossen"
  ```
