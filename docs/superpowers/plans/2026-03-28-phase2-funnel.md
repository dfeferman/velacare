# Phase 2 Funnel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/beantragen` with v2 UI (3 steps, new fields) backed by real Supabase Auth signup and Prisma DB writes — users get a real account, all application data lands in the database.

**Architecture:** `page.tsx` (Client Component) orchestrates 3 step components, holding full state. Step3 calls the `registerKunde()` Server Action which validates, signs up via Supabase Auth, sets the `kunde` role via the Admin API, then writes KundenProfile + BoxKonfiguration + Einwilligungen in a single Prisma interactive transaction before redirecting to `/beantragen/danke`. Shared Zod schema validates on both client and server.

**Tech Stack:** Next.js 14 App Router · Supabase Auth (`@supabase/ssr`) · Prisma 5 (`$transaction` interactive form) · Zod 3 · `useTransition` (loading state) · Tailwind v2 design tokens (funnel-only)

**Precondition:** Phase 1 complete — Supabase project exists, `.env.local` configured, Prisma schema migrated, `src/lib/supabase/server.ts` and `src/lib/prisma.ts` exist.

---

## File Structure

```
src/
  lib/
    schemas/
      register.ts           NEW  — shared Zod schema (Step2Data type + registerSchema)
    supabase/
      admin.ts              NEW  — Service Role client (server-only)
  app/
    actions/
      register.ts           NEW  — registerKunde() Server Action
    beantragen/
      page.tsx              MODIFY — v2 orchestrator (3 steps, full state)
      step1-produktauswahl.tsx  NEW  — product selector, no prices, v2 design
      step2-daten.tsx       MODIFY — complete rewrite: new fields + registerSchema + v2 design
      step3-bestaetigung.tsx    NEW  — summary + liefertag + AGB/DSGVO + server action
      danke/page.tsx        MODIFY — add E-Mail-Bestätigungs-Hinweis
      step1-anspruch.tsx    DELETE
      step3-box.tsx         DELETE
      step4-bestaetigung.tsx    DELETE

prisma/
  schema.prisma             MODIFY — VersorgungsSituation enum, KundenProfile new fields,
                                     Einwilligung @@unique

tailwind.config.ts          MODIFY — v2 color tokens + font-manrope
src/app/globals.css         MODIFY — Manrope Google Font import + CSS var
```

---

## Task 1: v2 Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Manrope to Google Fonts import in `src/app/globals.css`**

Replace the existing `@import url(...)` line (line 1) with:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&family=Newsreader:ital,wght@0,400;0,500;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap');
```

- [ ] **Step 2: Add `--font-manrope` CSS variable in `src/app/globals.css`**

Add after the `--font-dm-mono` line inside `:root`:

```css
  --font-manrope: 'Manrope', system-ui, sans-serif;
```

- [ ] **Step 3: Add v2 color tokens and `font-manrope` to `tailwind.config.ts`**

In `tailwind.config.ts`, inside `theme.extend.colors`, add a `v2` block after the existing colors:

```typescript
v2: {
  primary:          '#00A3AD',
  secondary:        '#00696f',
  surface:          '#f4fafd',
  'surface-low':    '#eef5f7',
  'surface-mid':    '#e8eff1',
  'surface-lowest': '#ffffff',
  'on-surface':     '#161d1f',
  'on-surface-v':   '#3d494a',
  'outline-v':      '#bcc9ca',
  error:            '#ba1a1a',
  'error-bg':       '#ffdad6',
},
```

In `theme.extend.fontFamily`, add after the `mono` entry:

```typescript
manrope: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: build succeeds (or only pre-existing errors, none from the config changes).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add v2 design tokens and Manrope font for funnel"
```

---

## Task 2: Shared Zod Schema

**Files:**
- Create: `src/lib/schemas/register.ts`

- [ ] **Step 1: Create `src/lib/schemas/register.ts`**

```typescript
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
  // Account
  email:                z.string().email('Gültige E-Mail-Adresse erforderlich'),
  passwort:             z.string().min(8, 'Mindestens 8 Zeichen'),
})

export type Step2Data = z.infer<typeof registerSchema>
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors from `src/lib/schemas/register.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/schemas/register.ts
git commit -m "feat: add shared Zod register schema for funnel"
```

---

## Task 3: Admin Supabase Client

**Files:**
- Create: `src/lib/supabase/admin.ts`

- [ ] **Step 1: Create `src/lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

/**
 * Service Role client — server-only. Never import in Client Components.
 * SUPABASE_SERVICE_ROLE_KEY must be a server-only env var (no NEXT_PUBLIC_ prefix).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors from `src/lib/supabase/admin.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/admin.ts
git commit -m "feat: add Supabase Admin client for Service Role operations"
```

---

## Task 4: Prisma Schema Ergänzungen + Migration

**Files:**
- Modify: `prisma/schema.prisma`

Phase 2 adds: `VersorgungsSituation` enum, 6 new fields on `KundenProfile`, `@@unique` on `Einwilligung`.

- [ ] **Step 1: Add `VersorgungsSituation` enum**

In `prisma/schema.prisma`, add this enum after the existing enums (e.g., after `EinwilligungTyp`):

```prisma
enum VersorgungsSituation {
  erstversorgung
  wechsel
}
```

- [ ] **Step 2: Add new fields to `KundenProfile` model**

In `prisma/schema.prisma`, inside the `KundenProfile` model, add the following fields after `krankenkasse`:

```prisma
  versicherungsnummer  String?              @db.VarChar(20)
  hausnummer           String?              @db.VarChar(10)
  adresszusatz         String?              @db.VarChar(100)
  versorgungssituation VersorgungsSituation @default(erstversorgung)
  beratung             Boolean              @default(false)
  lieferadresse_json   Json?
```

Note: `hausnummer` is nullable (`String?`) to allow the migration to run against existing Phase 1 data where the field doesn't exist yet.

- [ ] **Step 3: Add `@@unique` constraint to `Einwilligung` model**

In `prisma/schema.prisma`, inside the `Einwilligung` model, add before `@@map`:

```prisma
  @@unique([user_id, typ, version])
```

Full `Einwilligung` model should now end with:

```prisma
  profile Profile @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@unique([user_id, typ, version])
  @@map("einwilligungen")
}
```

- [ ] **Step 4: Create and apply migration**

```bash
npx prisma migrate dev --name phase2_funnel_fields
```

Expected output:
```
The following migration(s) have been created and applied from new schema changes:

migrations/YYYYMMDDHHMMSS_phase2_funnel_fields/migration.sql

Your database is now in sync with your schema.
```

If the migration fails because `hausnummer` has no default: confirm it is `String?` (nullable) — nullable columns can be added without defaults.

- [ ] **Step 5: Regenerate Prisma Client**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client`

- [ ] **Step 6: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Phase 2 Prisma fields — VersorgungsSituation, KundenProfile extensions, Einwilligung unique constraint"
```

---

## Task 5: Server Action `registerKunde()`

**Files:**
- Create: `src/app/actions/register.ts`

This is the core backend logic for the funnel. All DB writes are inside a single interactive Prisma transaction. `BoxKonfiguration.kunde_id` references `KundenProfile.id` (the UUID primary key), so the interactive transaction form (`async (tx) => {...}`) is required — the KundenProfile must be created first to obtain its `id`.

- [ ] **Step 1: Create `src/app/actions/register.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'
import type { BoxProdukt } from '@/lib/types'

export async function registerKunde(
  produkte: BoxProdukt[],
  liefertag: number,
  step2: Step2Data
): Promise<{ error?: string }> {

  // 0. Server-side validation — never trust client data
  const result = registerSchema.safeParse(step2)
  if (!result.success) return { error: 'Ungültige Eingabedaten.' }
  const d = result.data

  // 1. Supabase Auth signup
  const supabase = createClient()
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: d.email,
    password: d.passwort,
  })

  if (signUpError) {
    const msg = signUpError.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already exists')) {
      return { error: 'Diese E-Mail-Adresse ist bereits registriert.' }
    }
    return { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Registrierung fehlgeschlagen.' }

  // 2. Set app_metadata.rolle = 'kunde' via Admin API (server-only)
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { rolle: 'kunde' },
  })

  // 3. Prisma interactive transaction: KundenProfile → BoxKonfiguration → Einwilligungen
  const headersList = headers()
  const ipAdresse = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0'
  const userAgent = headersList.get('user-agent') ?? 'funnel-v2'
  const gesamtpreis = produkte.reduce((sum, item) => sum + Number(item.produkt.preis), 0)

  try {
    await prisma.$transaction(async (tx) => {

      // 3a. KundenProfile upsert (idempotent: safe on retry or DB-trigger race)
      const profile = await tx.kundenProfile.upsert({
        where:  { user_id: userId },
        create: {
          user_id:              userId,
          vorname:              d.vorname,
          nachname:             d.nachname,
          geburtsdatum:         new Date(d.geburtsdatum),
          pflegegrad:           d.pflegegrad,
          krankenkasse:         d.krankenkasse,
          versicherungsnummer:  d.versicherungsnummer,
          strasse:              d.strasse,
          hausnummer:           d.hausnummer,
          adresszusatz:         d.adresszusatz,
          plz:                  d.plz,
          ort:                  d.ort,
          telefon:              d.telefon,
          versorgungssituation: d.versorgungssituation,
          beratung:             d.beratung,
          lieferadresse_json:   d.lieferadresse_abweichend ? d.lieferadresse ?? null : null,
          lieferstichtag:       liefertag,
        },
        update: {
          vorname:              d.vorname,
          nachname:             d.nachname,
          geburtsdatum:         new Date(d.geburtsdatum),
          pflegegrad:           d.pflegegrad,
          krankenkasse:         d.krankenkasse,
          versicherungsnummer:  d.versicherungsnummer,
          strasse:              d.strasse,
          hausnummer:           d.hausnummer,
          adresszusatz:         d.adresszusatz,
          plz:                  d.plz,
          ort:                  d.ort,
          telefon:              d.telefon,
          versorgungssituation: d.versorgungssituation,
          beratung:             d.beratung,
          lieferadresse_json:   d.lieferadresse_abweichend ? d.lieferadresse ?? null : null,
          lieferstichtag:       liefertag,
        },
      })

      // 3b. BoxKonfiguration: kunde_id references KundenProfile.id (UUID primary key)
      await tx.boxKonfiguration.create({
        data: {
          kunde_id:    profile.id,
          produkte:    produkte as object,
          gesamtpreis,
        },
      })

      // 3c. Einwilligungen — skipDuplicates protects against retry / double-submit
      await tx.einwilligung.createMany({
        data: [
          { user_id: userId, typ: 'agb',   version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
          { user_id: userId, typ: 'dsgvo',  version: '1.0', ip_adresse: ipAdresse, user_agent: userAgent },
        ],
        skipDuplicates: true,
      })
    })
  } catch {
    return { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }
  }

  // Redirect happens outside try/catch — Next.js throws internally on redirect()
  redirect('/beantragen/danke')
}
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from `src/app/actions/register.ts`. If Prisma reports missing fields (e.g., `hausnummer` not on schema), rerun `npx prisma generate`.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/register.ts
git commit -m "feat: add registerKunde server action with atomic Prisma transaction"
```

---

## Task 6: Step1 Produktauswahl v2 (New)

**Files:**
- Create: `src/app/beantragen/step1-produktauswahl.tsx`

New product selector replacing old Step3. Key difference from v1: **no prices shown**. Budget tracker shows percentage used but not euro amounts.

- [ ] **Step 1: Create `src/app/beantragen/step1-produktauswahl.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { MOCK_PRODUKTE, MOCK_BUDGET_LIMIT } from '@/lib/mock-data'
import type { BoxProdukt, Produkt, ProduktKategorie } from '@/lib/types'

interface Step1Props {
  onWeiter: (produkte: BoxProdukt[]) => void
}

const KATEGORIEN: ProduktKategorie[] = [
  'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges',
]

export function Step1Produktauswahl({ onWeiter }: Step1Props) {
  const [gewählt, setGewählt]   = useState<BoxProdukt[]>([])
  const [kategorie, setKategorie] = useState<ProduktKategorie | 'alle'>('alle')

  const verwendetBetrag = gewählt.reduce((s, i) => s + Number(i.produkt.preis), 0)
  const budgetProzent   = Math.min((verwendetBetrag / MOCK_BUDGET_LIMIT) * 100, 100)
  const restBudget      = MOCK_BUDGET_LIMIT - verwendetBetrag

  const toggle = (produkt: Produkt) => {
    setGewählt(prev => {
      const exists = prev.some(p => p.produkt.id === produkt.id)
      if (exists) return prev.filter(p => p.produkt.id !== produkt.id)
      if (verwendetBetrag + Number(produkt.preis) > MOCK_BUDGET_LIMIT) return prev
      return [...prev, { produkt, menge: null }]
    })
  }

  const gefiltert = kategorie === 'alle'
    ? MOCK_PRODUKTE
    : MOCK_PRODUKTE.filter(p => p.kategorie === kategorie)

  return (
    <div className="min-h-screen bg-v2-surface font-manrope">
      {/* Sticky budget bar */}
      <div className="sticky top-0 z-10 bg-v2-surface-lowest border-b border-v2-outline-v">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-v2-surface-mid rounded-full overflow-hidden">
              <div
                className="h-full bg-v2-primary rounded-full transition-all"
                style={{ width: `${budgetProzent}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-v2-on-surface-v whitespace-nowrap">
            {restBudget.toFixed(2).replace('.', ',')} € verfügbar
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl text-v2-on-surface mb-2">
            Ihre Pflegehilfsmittel
          </h1>
          <p className="text-v2-on-surface-v">
            Stellen Sie Ihre persönliche Box zusammen. Alle Produkte sind für Sie kostenlos.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(['alle', ...KATEGORIEN] as const).map(kat => (
            <button
              key={kat}
              onClick={() => setKategorie(kat)}
              className={[
                'px-4 py-1.5 rounded-full text-sm transition-colors',
                kategorie === kat
                  ? 'bg-v2-primary text-white'
                  : 'bg-v2-surface-mid text-v2-on-surface-v hover:bg-v2-surface-low',
              ].join(' ')}
            >
              {kat === 'alle' ? 'Alle' : kat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {gefiltert.map(produkt => {
            const selected  = gewählt.some(p => p.produkt.id === produkt.id)
            const blocked   = !selected && verwendetBetrag + Number(produkt.preis) > MOCK_BUDGET_LIMIT
            return (
              <button
                key={produkt.id}
                onClick={() => toggle(produkt)}
                disabled={blocked}
                className={[
                  'text-left p-4 rounded-xl transition-all',
                  selected
                    ? 'bg-v2-primary text-white ring-2 ring-v2-primary'
                    : blocked
                    ? 'bg-v2-surface-mid text-v2-on-surface-v opacity-50 cursor-not-allowed'
                    : 'bg-v2-surface-lowest text-v2-on-surface hover:ring-2 hover:ring-v2-primary/40',
                ].join(' ')}
              >
                <p className="font-medium text-sm">{produkt.name}</p>
                <p className={['text-xs mt-1', selected ? 'text-white/80' : 'text-v2-on-surface-v'].join(' ')}>
                  {produkt.beschreibung}
                </p>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <button
            onClick={() => onWeiter(gewählt)}
            disabled={gewählt.length === 0}
            className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-v2-secondary transition-colors"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/beantragen/step1-produktauswahl.tsx
git commit -m "feat: add Step1 Produktauswahl v2 (no prices, teal design)"
```

---

## Task 7: Step2 Daten v2 (Complete Rewrite)

**Files:**
- Modify: `src/app/beantragen/step2-daten.tsx`

Complete rewrite. Old local Zod schema removed; uses shared `registerSchema`. All new fields added. v2 design applied.

- [ ] **Step 1: Replace full contents of `src/app/beantragen/step2-daten.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { registerSchema, type Step2Data } from '@/lib/schemas/register'

interface Step2Props {
  onWeiter:  (data: Step2Data) => void
  onZurueck: () => void
}

type FieldErrors = Partial<Record<keyof Step2Data | 'lieferadresse', string>>

const inputBase = 'w-full bg-v2-surface-low text-v2-on-surface px-3 py-2.5 rounded-t-sm border-0 border-b border-v2-outline-v focus:border-v2-primary focus:outline-none transition-colors text-sm'
const labelBase = 'block text-xs text-v2-on-surface-v mb-1'
const sectionCard = 'bg-v2-surface-lowest rounded-xl p-6 mb-4'

export function Step2Daten({ onWeiter, onZurueck }: Step2Props) {
  const [form, setForm] = useState<Partial<Step2Data>>({
    versorgungssituation: 'erstversorgung',
    beratung: false,
    lieferadresse_abweichend: false,
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const set = (key: keyof Step2Data, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setLieferadresse = (key: string, value: string) =>
    setForm(prev => ({
      ...prev,
      lieferadresse: { ...(prev.lieferadresse ?? { strasse: '', hausnummer: '', plz: '', ort: '' }), [key]: value },
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const errs: FieldErrors = {}
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        if (path.startsWith('lieferadresse.')) {
          errs.lieferadresse = issue.message
        } else {
          errs[path as keyof Step2Data] = issue.message
        }
      })
      setErrors(errs)
      return
    }
    setErrors({})
    onWeiter(result.data)
  }

  const err = (field: keyof FieldErrors) =>
    errors[field] ? <p className="text-v2-error text-xs mt-1">{errors[field]}</p> : null

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-v2-surface font-manrope">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-newsreader text-3xl text-v2-on-surface mb-2">Ihre Daten</h1>
        <p className="text-v2-on-surface-v mb-8">Bitte füllen Sie alle Felder vollständig aus.</p>

        {/* Pflegebedürftiger */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Pflegebedürftiger</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Vorname</label>
              <input className={inputBase} value={form.vorname ?? ''} onChange={e => set('vorname', e.target.value)} />
              {err('vorname')}
            </div>
            <div>
              <label className={labelBase}>Nachname</label>
              <input className={inputBase} value={form.nachname ?? ''} onChange={e => set('nachname', e.target.value)} />
              {err('nachname')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelBase}>Geburtsdatum</label>
              <input type="date" className={inputBase} value={form.geburtsdatum ?? ''} onChange={e => set('geburtsdatum', e.target.value)} />
              {err('geburtsdatum')}
            </div>
            <div>
              <label className={labelBase}>Pflegegrad</label>
              <select className={inputBase} value={form.pflegegrad ?? ''} onChange={e => set('pflegegrad', Number(e.target.value))}>
                <option value="">Bitte wählen</option>
                {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {err('pflegegrad')}
            </div>
          </div>
          <div>
            <label className={labelBase}>Telefon</label>
            <input type="tel" className={inputBase} value={form.telefon ?? ''} onChange={e => set('telefon', e.target.value)} />
            {err('telefon')}
          </div>
        </div>

        {/* Krankenkasse */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Krankenkasse</h2>
          <div className="mb-4">
            <label className={labelBase}>Krankenkasse</label>
            <input className={inputBase} placeholder="z. B. AOK Bayern" value={form.krankenkasse ?? ''} onChange={e => set('krankenkasse', e.target.value)} />
            {err('krankenkasse')}
          </div>
          <div>
            <label className={labelBase}>Versicherungsnummer</label>
            <input className={inputBase} value={form.versicherungsnummer ?? ''} onChange={e => set('versicherungsnummer', e.target.value)} />
            {err('versicherungsnummer')}
          </div>
        </div>

        {/* Adresse */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Adresse</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={labelBase}>Straße</label>
              <input className={inputBase} value={form.strasse ?? ''} onChange={e => set('strasse', e.target.value)} />
              {err('strasse')}
            </div>
            <div>
              <label className={labelBase}>Hausnummer</label>
              <input className={inputBase} value={form.hausnummer ?? ''} onChange={e => set('hausnummer', e.target.value)} />
              {err('hausnummer')}
            </div>
          </div>
          <div className="mb-4">
            <label className={labelBase}>Adresszusatz (optional)</label>
            <input className={inputBase} placeholder="Wohnung, Stockwerk, c/o …" value={form.adresszusatz ?? ''} onChange={e => set('adresszusatz', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelBase}>PLZ</label>
              <input className={inputBase} maxLength={5} value={form.plz ?? ''} onChange={e => set('plz', e.target.value)} />
              {err('plz')}
            </div>
            <div className="col-span-2">
              <label className={labelBase}>Ort</label>
              <input className={inputBase} value={form.ort ?? ''} onChange={e => set('ort', e.target.value)} />
              {err('ort')}
            </div>
          </div>

          {/* Abweichende Lieferadresse */}
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.lieferadresse_abweichend ?? false}
              onChange={e => set('lieferadresse_abweichend', e.target.checked)}
              className="accent-v2-primary"
            />
            <span className="text-sm text-v2-on-surface">Lieferadresse weicht von der obigen Adresse ab</span>
          </label>

          {form.lieferadresse_abweichend && (
            <div className="mt-4 pl-4 border-l-2 border-v2-outline-v space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelBase}>Straße (Lieferung)</label>
                  <input className={inputBase} value={form.lieferadresse?.strasse ?? ''} onChange={e => setLieferadresse('strasse', e.target.value)} />
                </div>
                <div>
                  <label className={labelBase}>Hausnummer</label>
                  <input className={inputBase} value={form.lieferadresse?.hausnummer ?? ''} onChange={e => setLieferadresse('hausnummer', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>PLZ</label>
                  <input className={inputBase} maxLength={5} value={form.lieferadresse?.plz ?? ''} onChange={e => setLieferadresse('plz', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelBase}>Ort</label>
                  <input className={inputBase} value={form.lieferadresse?.ort ?? ''} onChange={e => setLieferadresse('ort', e.target.value)} />
                </div>
              </div>
              {err('lieferadresse')}
            </div>
          )}
        </div>

        {/* Versorgung */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Versorgungssituation</h2>
          <div className="flex gap-6 mb-4">
            {(['erstversorgung', 'wechsel'] as const).map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="versorgungssituation"
                  value={val}
                  checked={form.versorgungssituation === val}
                  onChange={() => set('versorgungssituation', val)}
                  className="accent-v2-primary"
                />
                <span className="text-sm text-v2-on-surface capitalize">{val === 'erstversorgung' ? 'Erstversorgung' : 'Anbieterwechsel'}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.beratung ?? false}
              onChange={e => set('beratung', e.target.checked)}
              className="accent-v2-primary"
            />
            <span className="text-sm text-v2-on-surface">Ich möchte eine persönliche Beratung</span>
          </label>
        </div>

        {/* Konto erstellen */}
        <div className={sectionCard}>
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Konto erstellen</h2>
          <div className="mb-4">
            <label className={labelBase}>E-Mail-Adresse</label>
            <input type="email" className={inputBase} value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            {err('email')}
          </div>
          <div>
            <label className={labelBase}>Passwort (min. 8 Zeichen)</label>
            <input type="password" className={inputBase} value={form.passwort ?? ''} onChange={e => set('passwort', e.target.value)} />
            {err('passwort')}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button type="button" onClick={onZurueck} className="px-6 py-3 text-v2-on-surface-v hover:text-v2-on-surface transition-colors text-sm">
            ← Zurück
          </button>
          <button type="submit" className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium hover:bg-v2-secondary transition-colors">
            Weiter
          </button>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/beantragen/step2-daten.tsx
git commit -m "feat: rewrite Step2 Daten with new fields, shared schema, v2 design"
```

---

## Task 8: Step3 Bestätigung v2 (New)

**Files:**
- Create: `src/app/beantragen/step3-bestaetigung.tsx`

Shows summary of step1 + step2 data. Liefertag is local state. Calls `registerKunde()` via `useTransition`.

- [ ] **Step 1: Create `src/app/beantragen/step3-bestaetigung.tsx`**

```typescript
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
              Ich stimme den <a href="/agb" className="text-v2-primary underline" target="_blank">Allgemeinen Geschäftsbedingungen</a> zu.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={dsgvo} onChange={e => setDsgvo(e.target.checked)} className="mt-0.5 accent-v2-primary" />
            <span className="text-sm text-v2-on-surface">
              Ich habe die <a href="/datenschutz" className="text-v2-primary underline" target="_blank">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.
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
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/beantragen/step3-bestaetigung.tsx
git commit -m "feat: add Step3 Bestätigung v2 with server action and loading state"
```

---

## Task 9: page.tsx v2 (Rewrite)

**Files:**
- Modify: `src/app/beantragen/page.tsx`

Rewires the funnel to 3 steps and passes full state down to step components.

- [ ] **Step 1: Replace full contents of `src/app/beantragen/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { FunnelHeader } from '@/components/funnel/funnel-header'
import { Step1Produktauswahl } from './step1-produktauswahl'
import { Step2Daten } from './step2-daten'
import { Step3Bestaetigung } from './step3-bestaetigung'
import type { BoxProdukt } from '@/lib/types'
import type { Step2Data } from '@/lib/schemas/register'

export default function BeantragenPage() {
  const [schritt, setSchritt] = useState<1 | 2 | 3>(1)
  const [step1, setStep1]     = useState<BoxProdukt[] | null>(null)
  const [step2, setStep2]     = useState<Step2Data | null>(null)

  const zurueck = schritt > 1 ? () => setSchritt(s => (s - 1) as 1 | 2 | 3) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <FunnelHeader onZurueck={zurueck} zeigeSchliessen={schritt === 1} />
      <div className="flex-1">
        {schritt === 1 && (
          <Step1Produktauswahl
            onWeiter={produkte => { setStep1(produkte); setSchritt(2) }}
          />
        )}
        {schritt === 2 && (
          <Step2Daten
            onWeiter={data => { setStep2(data); setSchritt(3) }}
            onZurueck={() => setSchritt(1)}
          />
        )}
        {schritt === 3 && step1 !== null && step2 !== null && (
          <Step3Bestaetigung
            step1={step1}
            step2={step2}
            onZurueck={() => setSchritt(2)}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/beantragen/page.tsx
git commit -m "feat: rewrite funnel page.tsx for v2 3-step flow"
```

---

## Task 10: Danke-Seite v2

**Files:**
- Modify: `src/app/beantragen/danke/page.tsx`

Adds the E-Mail-Bestätigungs-Hinweis. Removes the "Für jemanden beantragen" CTA.

- [ ] **Step 1: Read the current file**

```bash
cat src/app/beantragen/danke/page.tsx
```

- [ ] **Step 2: Replace full contents of `src/app/beantragen/danke/page.tsx`**

```typescript
import Link from 'next/link'

export default function DankePage() {
  return (
    <div className="min-h-screen bg-v2-surface font-manrope flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success icon */}
        <div className="w-16 h-16 bg-v2-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-v2-primary" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-newsreader text-3xl text-v2-on-surface text-center mb-3">
          Vielen Dank für Ihr Vertrauen
        </h1>

        {/* E-Mail-Bestätigungs-Hinweis */}
        <div className="bg-v2-surface-lowest rounded-xl px-6 py-5 mb-6 text-sm text-v2-on-surface-v">
          <p className="font-medium text-v2-on-surface mb-1">Bitte bestätigen Sie Ihre E-Mail-Adresse</p>
          <p>
            Wir haben Ihnen eine Bestätigungs-E-Mail geschickt. Bitte klicken Sie auf den Link
            in dieser E-Mail, um Ihr Konto zu aktivieren. Erst danach kann Ihr Antrag bearbeitet werden.
          </p>
        </div>

        {/* Nächste Schritte */}
        <div className="bg-v2-surface-lowest rounded-xl px-6 py-5 mb-8">
          <h2 className="font-newsreader text-lg text-v2-on-surface mb-4">Was passiert als nächstes?</h2>
          <ol className="space-y-3">
            {[
              { n: 1, text: 'Wir prüfen Ihren Antrag und die Erstattungsfähigkeit.' },
              { n: 2, text: 'Sie erhalten eine Bestätigung mit Ihrem Liefertermin.' },
              { n: 3, text: 'Ihre erste Box wird monatlich geliefert — kostenlos.' },
            ].map(step => (
              <li key={step.n} className="flex gap-3">
                <span className="w-6 h-6 bg-v2-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </span>
                <span className="text-sm text-v2-on-surface-v">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="px-8 py-3 bg-v2-primary text-white rounded-xl font-medium hover:bg-v2-secondary transition-colors inline-block"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/beantragen/danke/page.tsx
git commit -m "feat: update Danke-Seite with e-mail confirmation notice and v2 design"
```

---

## Task 11: Alte Dateien löschen

**Files:**
- Delete: `src/app/beantragen/step1-anspruch.tsx`
- Delete: `src/app/beantragen/step3-box.tsx`
- Delete: `src/app/beantragen/step4-bestaetigung.tsx`

- [ ] **Step 1: Delete the three old step files**

```bash
rm src/app/beantragen/step1-anspruch.tsx
rm src/app/beantragen/step3-box.tsx
rm src/app/beantragen/step4-bestaetigung.tsx
```

- [ ] **Step 2: Verify no broken imports remain**

```bash
npx tsc --noEmit 2>&1
```

Expected: no `Cannot find module` errors for the deleted files. If any other file still imports them, remove that import.

```bash
npm run lint 2>&1 | head -30
```

Expected: no lint errors from the deleted files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete old v1 funnel step files (step1-anspruch, step3-box, step4-bestaetigung)"
```

---

## Task 12: Smoke Test

**No automated test suite exists. Verify manually in the browser.**

**Prerequisite:** Phase 1 complete with a running Supabase project and `.env.local` configured.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3001/beantragen`

- [ ] **Step 2: Verify Step 1 — Produktauswahl**

- Budget bar visible at top
- Products render without prices
- Category filter tabs work
- Clicking a product selects it (ring highlight)
- Budget remaining updates
- "Weiter" disabled with 0 products, enabled after selecting at least 1
- Clicking "Weiter" advances to Step 2

- [ ] **Step 3: Verify Step 2 — Daten**

- All form sections render: Pflegebedürftiger, Krankenkasse, Adresse, Versorgung, Konto
- Submitting empty form shows validation errors per field
- `lieferadresse` section appears when checkbox is ticked
- Valid data → advances to Step 3
- "Zurück" returns to Step 1 (product selection preserved)

- [ ] **Step 4: Verify Step 3 — Bestätigung**

- Shows products from Step 1 (no prices)
- Shows personal data from Step 2 (name, Pflegegrad, Krankenkasse, Adresse, E-Mail)
- Liefertag selector shows 1–28
- Konto-Hinweis text visible
- "Jetzt kostenfrei beantragen" disabled until both AGB + DSGVO checked
- Clicking "Zurück" returns to Step 2 (form data preserved)

- [ ] **Step 5: Submit the form (requires Phase 1 Supabase connection)**

Fill all fields with test data, check both boxes, click submit:

- Button shows "Wird verarbeitet …" while pending
- On success: redirect to `/beantragen/danke`
- On duplicate e-mail: error message shown in Step 3 (no redirect)

- [ ] **Step 6: Verify Danke-Seite**

- Success icon + heading visible
- E-Mail-Bestätigungs-Hinweis visible
- "Was passiert als nächstes?" with 3 steps visible
- "Zur Startseite" button leads to `/`

- [ ] **Step 7: Verify other pages unaffected**

- `/` (Landing) — loads normally
- `/konto` — mock-protected, redirects to `/login`
- `/admin` — mock-protected, redirects to `/login`

- [ ] **Step 8: Final build check**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or lint errors.

- [ ] **Step 9: Commit if any smoke-test fixes were needed**

```bash
git add -A
git commit -m "fix: smoke test corrections for Phase 2 funnel"
```

---

## Lieferergebnis

Nach Abschluss sind alle Punkte aus der Phase 2 Spec erfüllt:

- `src/lib/schemas/register.ts` — gemeinsames Zod-Schema (Client + Server)
- `src/lib/supabase/admin.ts` — Service Role Client (server-only)
- `src/app/actions/register.ts` — `registerKunde()` mit Prisma-Transaktion + Fehlerbehandlung
- Neuer 3-stufiger Funnel unter `/beantragen` (v2 UI, keine Preisanzeige)
- Step2 mit allen neuen Feldern, Client-Validierung via `registerSchema`
- Step3 mit echten Nutzerdaten, Liefertag-Auswahl, Doppelklick-Schutz, Konto-Hinweis
- Danke-Seite mit E-Mail-Bestätigungs-Hinweis
- Prisma-Migration: `VersorgungsSituation` enum, 6 neue `KundenProfile`-Felder, `@@unique` auf `Einwilligung`
- Alle anderen Seiten unverändert (Mock-Daten weiterhin aktiv)
