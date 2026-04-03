# Unterschrift-Widget im Beantragen-Funnel — Design

## Ziel

Im Beantragen-Funnel (Schritt 2 „Ihre Daten") das bisherige „Konto erstellen"-Widget (E-Mail-Feld) nach Schritt 3 verschieben und durch ein Unterschrift-Widget ersetzen. Der Kunde kann entweder mit der Maus/Touch frei unterschreiben oder per Button seinen Nachnamen in einer von drei Handschrift-Schriftarten einfügen. Die Unterschrift ist Pflichtfeld. Sie wird als PNG-DataURL durch den Funnel gereicht, in Schritt 3 in der Zusammenfassung angezeigt und später in der Datenbank gespeichert.

## Architektur

Der Funnel (`beantragen/page.tsx`) hält einen neuen State `unterschrift: string | null`. Schritt 2 liefert die Unterschrift per `onWeiter`-Callback. Schritt 3 erhält `unterschrift` als Prop, zeigt sie als Vorschau und sammelt die E-Mail-Adresse lokal. Beim Absenden ruft Schritt 3 `registerKunde()` mit `email` und `unterschrift` als separate Parameter auf. Die Unterschrift wird in `KundenProfile.unterschrift` (nullable TEXT) gespeichert.

## Tech-Stack

- `react-signature-canvas` — Canvas-Wrapper mit Maus/Touch-Support und Bezier-Glättung
- Google Fonts: **Dancing Script**, **Satisfy**, **Kalam** — per `@import` in `globals.css`
- Canvas 2D API `fillText()` — für Font-Button-Rendering

---

## Detailliertes Design

### 1. Schema-Änderungen

**`src/lib/schemas/register.ts`**

`email` wird aus `registerSchema` entfernt. Ein eigenes `emailSchema` (`z.string().email()`) wird exportiert und in Schritt 3 verwendet.

```ts
// Vorher: registerSchema enthält email
// Nachher:
export const emailSchema = z.string().email('Ungültige E-Mail-Adresse')
export const registerSchema = z.object({
  // alle Felder wie bisher, OHNE email
  vorname: ...,
  nachname: ...,
  // ...
})
```

**`prisma/schema.prisma`**

Neues Feld in `KundenProfile`:
```prisma
unterschrift String? // PNG DataURL der Unterschrift
```

Migration: `ALTER TABLE "kunden_profile" ADD COLUMN "unterschrift" TEXT;`

---

### 2. Neue Komponente: `SignaturPad`

**Datei:** `src/components/funnel/SignaturPad.tsx`

**Props:**
```ts
interface SignaturPadProps {
  nachname: string
  onChange: (dataUrl: string | null) => void
}
```

**Aufbau:**
- `ReactSignatureCanvas` Ref (`sigRef`)
- 3 Font-Buttons oberhalb des Canvas:
  - `Dancing Script`, `Satisfy`, `Kalam`
  - Klick: `sigRef.current.clear()` → Canvas 2D `fillText(nachname, ...)` mit der jeweiligen Schriftart
  - Aktiver Button visuell hervorgehoben (v3-primary-pale + Rahmen)
- Canvas: 100% Breite, 140px Höhe, weißer Hintergrund, schwarzer Stift (2px)
- Rahmen: `border border-v3-outline/60 rounded-lg`
- "Löschen"-Link unterhalb: `sigRef.current.clear()` → `onChange(null)`
- Bei jedem Stroke-Ende: `onChange(sigRef.current.toDataURL('image/png'))`

**Font-Loading:**
In `src/app/globals.css` ganz oben:
```css
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Satisfy&family=Kalam:wght@400&display=swap');
```

**Font-Button-Rendering (Canvas 2D):**
```ts
function renderFont(canvas: HTMLCanvasElement, nachname: string, font: string) {
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `48px '${font}'`
  ctx.fillStyle = '#1a1a1a'
  ctx.fillText(nachname, 24, 90)
}
```

---

### 3. Änderungen Step 2 (`step2-daten.tsx`)

- **Entfernen:** Block `{/* ── Konto erstellen ── */}` (E-Mail-Feld) komplett
- **Hinzufügen:** Neuer Block `{/* ── Unterschrift ── */}` als letztes Widget vor Navigation:

```tsx
<div className={sectionCard}>
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-1">Unterschrift</h2>
  <p className="text-v3-on-surface-v text-sm mb-4 leading-relaxed">
    Bitte unterschreiben Sie hier oder wählen Sie eine der Schriftarten.
  </p>
  <SignaturPad
    nachname={form.nachname ?? ''}
    onChange={sig => setUnterschrift(sig)}
  />
  {!unterschrift && submitted && (
    <p className="text-danger text-xs mt-2">Unterschrift ist erforderlich.</p>
  )}
</div>
```

- `onWeiter`-Callback: übergibt `step2Data` + `unterschrift` (beide als separate Props):

```ts
// beantragen/page.tsx ruft auf:
onWeiter={(data, sig) => { setStep2(data); setUnterschrift(sig); setSchritt(3) }}
```

- Submit-Guard: Button bleibt deaktiviert wenn `!unterschrift`

---

### 4. Änderungen Step 3 (`step3-bestaetigung.tsx`)

**Neue Props:**
```ts
interface Step3Props {
  step1:        BoxProdukt[]
  step2:        Step2Data
  unterschrift: string          // PNG DataURL
  onZurueck:    () => void
}
```

**Neuer Block „Unterschrift" in der Zusammenfassung** (nach Angaben-Sektion):
```tsx
<section className="bg-white rounded-xl p-6 mb-4 border border-v3-outline/60 shadow-sm shadow-black/[0.08]">
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-3">Unterschrift</h2>
  <img
    src={unterschrift}
    alt="Ihre Unterschrift"
    className="max-w-full h-auto rounded border border-v3-outline/40"
    style={{ maxHeight: 100 }}
  />
</section>
```

**Neuer Block „Konto erstellen"** (direkt vor AGB/DSGVO-Checkboxen):
```tsx
<section className="bg-white rounded-xl p-6 mb-4 border border-v3-outline/60 shadow-sm shadow-black/[0.08]">
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-1">Konto erstellen</h2>
  <p className="text-v3-on-surface-v text-sm mb-4 leading-relaxed">
    Sie erhalten per E-Mail einen Einmallink — kein Passwort nötig.
  </p>
  <label htmlFor="email" className={labelBase}>E-Mail-Adresse</label>
  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} ... />
</section>
```

- `email` als lokaler State in Step 3 (`useState<string>('')`)
- `canSubmit`: zusätzlich `&& email.trim().length > 0` (Basis-Validierung)
- `registerKunde(step1, liefertag, step2, email, unterschrift)` Aufruf

---

### 5. Änderungen `beantragen/page.tsx`

```ts
const [unterschrift, setUnterschrift] = useState<string | null>(null)

// Step 2 onWeiter:
onWeiter={(data, sig) => { setStep2(data); setUnterschrift(sig); setSchritt(3) }}

// Step 3 Props:
<Step3Bestaetigung
  step1={box}
  step2={step2!}
  unterschrift={unterschrift!}
  onZurueck={() => setSchritt(2)}
/>
```

---

### 6. Änderungen `register.ts` (Server Action)

```ts
export async function registerKunde(
  produkte:     BoxProdukt[],
  liefertag:    number,
  step2:        Step2Data,
  email:        string,       // neu: von Step 3
  unterschrift: string,       // neu: PNG DataURL
): Promise<{ error?: string }>
```

- `email` per `emailSchema.safeParse(email)` validieren
- `unterschrift` in `KundenProfile.create` und `.update` speichern

---

## Reihenfolge der Widgets in Step 3 (final)

1. Ihre Box (Produktauswahl)
2. Angaben (persönliche Daten)
3. **Unterschrift** ← neu
4. Liefertag
5. **Konto erstellen** ← verschoben von Step 2
6. AGB + DSGVO Checkboxen
7. Navigation (Zurück / Absenden)

---

## Was nicht enthalten ist

- PDF-Generierung (separates Feature, späterer Schritt)
- Mobile Stylus-Druck-Simulation
- Unterschrift-Validierung gegen Mindest-Strichanzahl
