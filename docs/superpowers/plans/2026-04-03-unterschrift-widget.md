# Unterschrift-Widget im Beantragen-Funnel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Signature pad in Step 2 (mouse/touch draw + 3 handwriting font buttons), email field moved to Step 3, signature passed through funnel and stored in DB.

**Architecture:** `SignaturPad` component wraps `react-signature-canvas`; signature PNG DataURL flows via `beantragen-content.tsx` state from Step 2 → Step 3; email separated from `Step2Data` schema and collected in Step 3; `registerKunde()` receives `email` + `unterschrift` as new params.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS (v3 tokens), `react-signature-canvas`, Google Fonts (Dancing Script, Satisfy, Kalam), Prisma 7.6, Supabase PostgreSQL.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/schemas/register.ts` | Modify | Remove `email` from schema; export `emailSchema` |
| `prisma/schema.prisma` | Modify | Add `unterschrift String?` to `KundenProfile` |
| `prisma/migrations/20260403000000_add_unterschrift/migration.sql` | Create | SQL migration for new column |
| `src/components/funnel/SignaturPad.tsx` | Create | Canvas + font buttons + clear |
| `src/app/globals.css` | Modify | Add Google Fonts `@import` for 3 handwriting fonts |
| `src/app/beantragen/step2-daten.tsx` | Modify | Remove email block; add SignaturPad section |
| `src/app/beantragen/beantragen-content.tsx` | Modify | Add `unterschrift` state; update callbacks |
| `src/app/beantragen/step3-bestaetigung.tsx` | Modify | Add email field + signature preview; update submit |
| `src/app/actions/register.ts` | Modify | Add `email` + `unterschrift` params; save to DB |

---

## Task 1: Install dependency + add Google Fonts

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/app/globals.css`

- [ ] **Step 1: Install react-signature-canvas**

```bash
npm install react-signature-canvas
npm install --save-dev @types/react-signature-canvas
```

Expected: no errors, `react-signature-canvas` appears in `package.json` dependencies.

- [ ] **Step 2: Add Google Fonts import to globals.css**

Open `src/app/globals.css`. Add this as the very first line (before any existing `@import` or `@tailwind` directives):

```css
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Satisfy&family=Kalam:wght@400&display=swap');
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build 2>&1 | grep -E "✓ Compiled|error TS|Error"
```

Expected: `✓ Compiled successfully` (TypeScript errors about new params are expected in later tasks — only structural errors matter here).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/app/globals.css
git commit -m "feat: install react-signature-canvas, add handwriting fonts"
```

---

## Task 2: Update schema — separate email from Step2Data

**Files:**
- Modify: `src/lib/schemas/register.ts`

**Context:** Currently `registerSchema` includes `email`. We remove it from there and export it as a standalone `emailSchema`. `Step2Data` (inferred from `registerSchema`) will no longer contain `email`. Step 3 will validate email separately.

- [ ] **Step 1: Replace the contents of `src/lib/schemas/register.ts`**

```ts
import { z } from 'zod'

export const registerSchema = z.object({
  // Pflegebedürftiger
  vorname:              z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname:             z.string().min(2, 'Mindestens 2 Zeichen'),
  geburtsdatum:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  pflegegrad:           z.number().int().min(1).max(5),
  telefon:              z.string().min(6, 'Pflichtfeld'),
  // Krankenkasse
  krankenkasse:         z.string().min(2, 'Pflichtfeld'),
  versicherungsnummer:  z.string().min(6, 'Mindestens 6 Zeichen'),
  // Adresse
  strasse:              z.string().min(2, 'Pflichtfeld'),
  hausnummer:           z.string().min(1, 'Pflichtfeld'),
  adresszusatz:         z.string().optional(),
  plz:                  z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
  ort:                  z.string().min(2, 'Pflichtfeld'),
  // Lieferadresse
  lieferadresse_abweichend: z.boolean(),
  lieferadresse: z.object({
    strasse:    z.string().min(2, 'Pflichtfeld'),
    hausnummer: z.string().min(1, 'Pflichtfeld'),
    plz:        z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
    ort:        z.string().min(2, 'Pflichtfeld'),
  }).optional(),
  // Versorgung
  versorgungssituation: z.enum(['erstversorgung', 'wechsel']),
  beratung:             z.boolean(),
})

export type Step2Data = z.infer<typeof registerSchema>

// Email is collected separately in Step 3
export const emailSchema = z.string().email('Gültige E-Mail-Adresse erforderlich')
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: errors only in `step2-daten.tsx` (email field no longer in schema) and `register.ts` (email param missing) — these will be fixed in later tasks. No other files should error.

- [ ] **Step 3: Commit**

```bash
git add src/lib/schemas/register.ts
git commit -m "feat: separate email from Step2Data schema, export emailSchema"
```

---

## Task 3: Prisma schema — add unterschrift field + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260403000000_add_unterschrift/migration.sql`

- [ ] **Step 1: Add `unterschrift` field to KundenProfile in `prisma/schema.prisma`**

Find the `KundenProfile` model (around line 101). Add `unterschrift` after `lieferstichtag`:

```prisma
  lieferstichtag           Int
  unterschrift             String?             // PNG DataURL der Unterschrift
  lieferung_status         KundeDeliveryStatus @default(aktiv)
```

- [ ] **Step 2: Create migration file**

Create directory and file `prisma/migrations/20260403000000_add_unterschrift/migration.sql`:

```sql
-- Add unterschrift column to kunden_profile
ALTER TABLE "kunden_profile" ADD COLUMN "unterschrift" TEXT;
```

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client (7.6.0) to .\src\generated\prisma`

- [ ] **Step 4: Apply migration in Supabase SQL Editor**

Run in Supabase dashboard → SQL Editor:

```sql
ALTER TABLE "kunden_profile" ADD COLUMN "unterschrift" TEXT;
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260403000000_add_unterschrift/migration.sql src/generated/
git commit -m "feat: add unterschrift field to KundenProfile schema"
```

---

## Task 4: Create SignaturPad component

**Files:**
- Create: `src/components/funnel/SignaturPad.tsx`

**Context:** This component wraps `react-signature-canvas`. It renders a canvas for free drawing, 3 font-style buttons above, and a "Löschen" link below. When any stroke ends or a font button is clicked, it calls `onChange(dataUrl)`. When cleared, it calls `onChange(null)`.

- [ ] **Step 1: Create `src/components/funnel/SignaturPad.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import ReactSignatureCanvas from 'react-signature-canvas'

interface SignaturPadProps {
  nachname: string
  onChange: (dataUrl: string | null) => void
}

const FONTS = [
  { label: 'A', family: 'Dancing Script', display: 'Dancing Script' },
  { label: 'B', family: 'Satisfy',        display: 'Satisfy' },
  { label: 'C', family: 'Kalam',          display: 'Kalam' },
] as const

export function SignaturPad({ nachname, onChange }: SignaturPadProps) {
  const sigRef = useRef<ReactSignatureCanvas>(null)
  const [activeFont, setActiveFont] = useState<string | null>(null)

  const handleStrokeEnd = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    onChange(sigRef.current.toDataURL('image/png'))
  }

  const applyFont = async (fontFamily: string) => {
    if (!sigRef.current) return
    const text = nachname.trim() || 'Unterschrift'
    // Ensure font is loaded before drawing
    await document.fonts.load(`48px "${fontFamily}"`)
    const canvas = sigRef.current.getCanvas()
    const ctx = canvas.getContext('2d')!
    // Clear SignatureCanvas internal state
    sigRef.current.clear()
    // Draw text on raw canvas
    ctx.font = `48px "${fontFamily}"`
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText(text, 24, Math.round(canvas.height * 0.65))
    setActiveFont(fontFamily)
    onChange(canvas.toDataURL('image/png'))
  }

  const handleClear = () => {
    sigRef.current?.clear()
    setActiveFont(null)
    onChange(null)
  }

  return (
    <div>
      {/* Font buttons */}
      <div className="flex gap-2 mb-3" role="group" aria-label="Schriftart für Unterschrift">
        {FONTS.map(f => (
          <button
            key={f.family}
            type="button"
            onClick={() => applyFont(f.family)}
            className={[
              'flex-1 py-2 px-3 rounded-lg border text-sm transition-all duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-1',
              activeFont === f.family
                ? 'border-v3-primary bg-v3-primary-pale text-v3-primary font-medium'
                : 'border-v3-outline/60 bg-white text-v3-on-surface hover:border-v3-primary/50 hover:bg-v3-primary-pale/30',
            ].join(' ')}
            style={{ fontFamily: f.family }}
            aria-pressed={activeFont === f.family}
          >
            {nachname.trim() || 'Muster'}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="rounded-lg border border-v3-outline/60 bg-white overflow-hidden">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#1a1a1a"
          canvasProps={{
            className: 'w-full',
            style: { height: 140, display: 'block' },
          }}
          onEnd={handleStrokeEnd}
        />
      </div>

      {/* Clear link */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-v3-on-surface-v hover:text-v3-on-surface transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary rounded"
        >
          Löschen
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "✓ Compiled|error TS.*SignaturPad"
```

Expected: No errors in SignaturPad.tsx itself. Errors in step2-daten.tsx and register.ts are expected (fixed in later tasks).

- [ ] **Step 3: Commit**

```bash
git add src/components/funnel/SignaturPad.tsx
git commit -m "feat: SignaturPad component with canvas drawing and font buttons"
```

---

## Task 5: Update Step 2 — remove email, add SignaturPad

**Files:**
- Modify: `src/app/beantragen/step2-daten.tsx`

**Context:** Step 2 currently collects `email` in a "Konto erstellen" block at the bottom. We remove that block entirely and add a "Unterschrift" block. The `onWeiter` callback changes signature: it now also passes `unterschrift: string` as a second argument.

- [ ] **Step 1: Update the `Step2Props` interface and state in `step2-daten.tsx`**

Find the top of the file. Change the `Step2Props` interface and add `unterschrift` state:

```tsx
'use client'

import { useState } from 'react'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'
import { SignaturPad } from '@/components/funnel/SignaturPad'

interface Step2Props {
  onWeiter:  (data: Step2Data, unterschrift: string) => void
  onZurueck: () => void
}
```

Inside `Step2Daten` function body, add state after existing state declarations:

```tsx
const [unterschrift, setUnterschrift] = useState<string | null>(null)
const [showSigError, setShowSigError]  = useState(false)
```

- [ ] **Step 2: Update the `handleSubmit` / form validation to require unterschrift**

Find the submit handler (it's a form `onSubmit`). Add the signature check. The existing pattern validates with Zod and sets errors. After Zod validation succeeds, add:

```tsx
if (!unterschrift) {
  setShowSigError(true)
  return
}
setShowSigError(false)
onWeiter(result.data, unterschrift)
```

The full submit handler should look like:

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  const result = registerSchema.safeParse(form)
  if (!result.success) {
    const fieldErrors: FieldErrors = {}
    result.error.errors.forEach(err => {
      const field = err.path[0] as keyof Step2Data | 'lieferadresse'
      if (!fieldErrors[field]) fieldErrors[field] = err.message
    })
    setErrors(fieldErrors)
    return
  }
  if (!unterschrift) {
    setShowSigError(true)
    return
  }
  setShowSigError(false)
  onWeiter(result.data, unterschrift)
}
```

- [ ] **Step 3: Remove the "Konto erstellen" section and add "Unterschrift" section**

Find and delete the entire `{/* ── Konto erstellen ── */}` block (lines ~354–372 in the current file):

```tsx
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
```

Replace it with the new Unterschrift block **in the same position** (before the Navigation section):

```tsx
{/* ── Unterschrift ── */}
<div className={sectionCard}>
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-1 flex items-center gap-2">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13c2-4 4-8 6-8s2 3 0 5-4 2-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 4l1-1M13 8h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
    Unterschrift
  </h2>
  <p className="text-v3-on-surface-v text-sm mb-4 leading-relaxed">
    Unterschreiben Sie mit der Maus oder wählen Sie eine der Schriftarten.
  </p>
  <SignaturPad
    nachname={form.nachname ?? ''}
    onChange={sig => { setUnterschrift(sig); setShowSigError(false) }}
  />
  {showSigError && (
    <p role="alert" className="text-[#E05A3A] text-xs mt-2">
      Bitte unterschreiben Sie, um fortzufahren.
    </p>
  )}
</div>
```

- [ ] **Step 4: Remove `email` from the initial form state**

Find the `useState<Partial<Step2Data>>` initialization. Remove `email` if present:

```tsx
const [form, setForm] = useState<Partial<Step2Data>>({
  versorgungssituation: 'erstversorgung',
  beratung: false,
  lieferadresse_abweichend: false,
})
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: errors only in `beantragen-content.tsx` (onWeiter signature mismatch) and `register.ts` — fixed in next tasks.

- [ ] **Step 6: Commit**

```bash
git add src/app/beantragen/step2-daten.tsx
git commit -m "feat: replace email field with SignaturPad in Step 2"
```

---

## Task 6: Update beantragen-content.tsx — add unterschrift state

**Files:**
- Modify: `src/app/beantragen/beantragen-content.tsx`

**Context:** This is the client component managing funnel state. It needs a new `unterschrift` state and passes it to Step 3.

- [ ] **Step 1: Replace the full contents of `src/app/beantragen/beantragen-content.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { FunnelHeader } from '@/components/funnel/funnel-header'
import { Step1Produktauswahl } from './step1-produktauswahl'
import { Step2Daten } from './step2-daten'
import { Step3Bestaetigung } from './step3-bestaetigung'
import type { BoxProdukt, Produkt } from '@/lib/types'
import type { Step2Data } from '@/lib/schemas/register'

interface BeantragenContentProps {
  produkte: Produkt[]
}

export function BeantragenContent({ produkte }: BeantragenContentProps) {
  const [schritt,      setSchritt]      = useState<1 | 2 | 3>(1)
  const [step1,        setStep1]        = useState<BoxProdukt[] | null>(null)
  const [step2,        setStep2]        = useState<Step2Data | null>(null)
  const [unterschrift, setUnterschrift] = useState<string | null>(null)

  const zurueck = schritt > 1 ? () => setSchritt(s => (s - 1) as 1 | 2 | 3) : undefined

  return (
    <div className="min-h-screen flex flex-col bg-v3-background">
      <FunnelHeader schritt={schritt} onZurueck={zurueck} zeigeSchliessen={schritt === 1} />
      <div className="flex-1">
        {schritt === 1 && (
          <Step1Produktauswahl
            produkte={produkte}
            onWeiter={gewaehlteProdukte => { setStep1(gewaehlteProdukte); setSchritt(2) }}
          />
        )}
        {schritt === 2 && (
          <Step2Daten
            onWeiter={(data, sig) => { setStep2(data); setUnterschrift(sig); setSchritt(3) }}
            onZurueck={() => setSchritt(1)}
          />
        )}
        {schritt === 3 && step1 !== null && step2 !== null && unterschrift !== null && (
          <Step3Bestaetigung
            step1={step1}
            step2={step2}
            unterschrift={unterschrift}
            onZurueck={() => setSchritt(2)}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: errors only in `step3-bestaetigung.tsx` (unterschrift prop not yet added) and `register.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/app/beantragen/beantragen-content.tsx
git commit -m "feat: add unterschrift state to funnel, pass to Step 3"
```

---

## Task 7: Update Step 3 — add email, show signature, move "Konto erstellen"

**Files:**
- Modify: `src/app/beantragen/step3-bestaetigung.tsx`

**Context:** Step 3 receives `unterschrift` as a new prop and renders a signature preview in the summary. It also gains an email field (moved from Step 2) in a "Konto erstellen" section before the checkboxes. `registerKunde` is called with `email` and `unterschrift` as extra parameters.

- [ ] **Step 1: Update imports and Step3Props interface**

At the top of `src/app/beantragen/step3-bestaetigung.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { registerKunde } from '@/app/actions/register'
import { emailSchema, type Step2Data } from '@/lib/schemas/register'
import type { BoxProdukt } from '@/lib/types'

interface Step3Props {
  step1:        BoxProdukt[]
  step2:        Step2Data
  unterschrift: string
  onZurueck:    () => void
}
```

- [ ] **Step 2: Add email state and update canSubmit**

Inside `Step3Bestaetigung`, add email state alongside existing state:

```tsx
const [email,    setEmail]   = useState('')
const [emailErr, setEmailErr] = useState<string | null>(null)
```

Update `canSubmit`:

```tsx
const canSubmit = agb && dsgvo && email.trim().length > 0 && !isPending
```

- [ ] **Step 3: Update handleSubmit to validate email and pass new params**

```tsx
const handleSubmit = () => {
  setError(null)
  const emailResult = emailSchema.safeParse(email)
  if (!emailResult.success) {
    setEmailErr(emailResult.error.errors[0].message)
    return
  }
  setEmailErr(null)
  startTransition(async () => {
    const result = await registerKunde(step1, liefertag, step2, email, unterschrift)
    if (result?.error) setError(result.error)
  })
}
```

- [ ] **Step 4: Add Unterschrift section to summary (after Angaben section)**

After the closing `</section>` of the Angaben block, add:

```tsx
{/* Unterschrift */}
<section className="bg-white rounded-xl p-6 mb-4 border border-v3-outline/60 shadow-sm shadow-black/[0.08]" aria-label="Ihre Unterschrift">
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-3 flex items-center gap-2">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13c2-4 4-8 6-8s2 3 0 5-4 2-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 4l1-1M13 8h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
    Unterschrift
  </h2>
  <div className="rounded-lg border border-v3-outline/40 bg-white overflow-hidden p-2">
    <img
      src={unterschrift}
      alt="Ihre Unterschrift"
      className="max-w-full h-auto"
      style={{ maxHeight: 100 }}
    />
  </div>
</section>
```

- [ ] **Step 5: Add "Konto erstellen" section before AGB/DSGVO checkboxes**

Find `{/* AGB + DSGVO */}` and insert before it:

```tsx
{/* Konto erstellen */}
<section className="bg-white rounded-xl p-6 mb-4 border border-v3-outline/60 shadow-sm shadow-black/[0.08]" aria-label="Konto erstellen">
  <h2 className="font-newsreader text-lg text-v3-on-surface mb-1 flex items-center gap-2">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
    Konto erstellen
  </h2>
  <p className="text-v3-on-surface-v text-sm mb-4 leading-relaxed">
    Sie erhalten per E-Mail einen Einmallink &mdash; kein Passwort n&ouml;tig.
  </p>
  <div>
    <label htmlFor="email" className="block text-xs font-medium text-v3-on-surface-v uppercase tracking-wide mb-1.5">
      E-Mail-Adresse
    </label>
    <input
      id="email"
      name="email"
      type="email"
      autoComplete="email"
      placeholder="ihre@email.de"
      value={email}
      onChange={e => { setEmail(e.target.value); setEmailErr(null) }}
      className={[
        'w-full bg-v3-surface border rounded-lg px-4 py-3',
        'text-v3-on-surface placeholder:text-v3-on-surface-v/50 text-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary/20 transition-colors duration-150',
        emailErr ? 'border-[#E05A3A] focus:border-[#E05A3A]' : 'border-v3-outline/60 focus:border-v3-primary',
      ].join(' ')}
      aria-invalid={!!emailErr || undefined}
      aria-describedby={emailErr ? 'err-email' : undefined}
    />
    {emailErr && (
      <p id="err-email" role="alert" className="text-[#E05A3A] text-xs mt-1">{emailErr}</p>
    )}
  </div>
</section>
```

- [ ] **Step 6: Verify build**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: errors only in `register.ts` (new params not yet added). Step 3 itself should compile cleanly.

- [ ] **Step 7: Commit**

```bash
git add src/app/beantragen/step3-bestaetigung.tsx
git commit -m "feat: add email field and signature preview to Step 3 confirmation"
```

---

## Task 8: Update register.ts server action

**Files:**
- Modify: `src/app/actions/register.ts`

**Context:** `registerKunde` needs two new parameters: `email: string` and `unterschrift: string`. Email was previously part of `Step2Data`; it now comes separately. `unterschrift` is stored in `KundenProfile`.

- [ ] **Step 1: Update the function signature and imports**

At the top of `src/app/actions/register.ts`, change the import to add `emailSchema`:

```ts
import { registerSchema, emailSchema, type Step2Data } from '@/lib/schemas/register'
```

Change the function signature:

```ts
export async function registerKunde(
  produkte:     BoxProdukt[],
  liefertag:    number,
  step2:        Step2Data,
  email:        string,
  unterschrift: string,
): Promise<{ error?: string }> {
```

- [ ] **Step 2: Add email validation after existing step2 validation**

After the existing `registerSchema.safeParse(step2)` block, add:

```ts
const emailResult = emailSchema.safeParse(email)
if (!emailResult.success) return { error: 'Ungültige E-Mail-Adresse.' }
```

- [ ] **Step 3: Update generateLink to use the separate email parameter**

Find the `generateLink` call. Change `d.email` to `email`:

```ts
const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email: email,
  options: { redirectTo: `${appUrl}/auth/callback` },
})
```

Also update the `already registered` error check (it uses `d.email` nowhere else, but update the email log reference):

```ts
// In the sendEmail call, change d.email → email:
to: email,
```

- [ ] **Step 4: Add `unterschrift` to KundenProfile upsert (create + update)**

In the `tx.kundenProfile.upsert` call, add `unterschrift` to both `create` and `update` objects:

```ts
create: {
  user_id:              authUserId,
  // ... all existing fields ...
  lieferstichtag:       liefertag,
  unterschrift:         unterschrift,
},
update: {
  // ... all existing fields ...
  lieferstichtag:       liefertag,
  unterschrift:         unterschrift,
},
```

- [ ] **Step 5: Verify full build is clean**

```bash
npm run build 2>&1 | grep -E "✓ Compiled|error TS|Error"
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/register.ts
git commit -m "feat: registerKunde accepts email + unterschrift, stores in DB"
```

---

## Final verification

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `http://localhost:3001/beantragen`
- [ ] Step 1: Produkte auswählen, Weiter
- [ ] Step 2: Formular ausfüllen — kein E-Mail-Feld sichtbar; Unterschrift-Block am Ende
  - Freihand-Unterschrift zeichnen → Weiter-Button wird aktiv
  - Clear → Weiter-Button deaktiviert
  - Font-Button klicken → Nachname erscheint in Schriftart auf Canvas
- [ ] Step 3: Zusammenfassung zeigt Unterschrift-Bild; "Konto erstellen" Block mit E-Mail-Feld vor AGB/DSGVO-Checkboxen
- [ ] E-Mail eingeben, AGB + DSGVO ankreuzen → Absenden
- [ ] Weiterleitung zu `/beantragen/danke`
