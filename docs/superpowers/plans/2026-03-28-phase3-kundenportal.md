# Phase 3 Kundenportal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mock data in the 5 `/konto/*` pages with real Prisma database reads, and activate two write operations (box update, new request).

**Architecture:** Server Components fetch data via a thin DAL (`src/lib/dal/konto.ts`) using `supabase.auth.getUser()` → `userId` → Prisma. Client Components handle UI state only and call Server Actions for writes. No `useEffect`, no browser fetches for DB data.

**Tech Stack:** Next.js 14 App Router · Prisma 5 · `@supabase/ssr` · TypeScript

**Voraussetzungen:** Phase 1 (Supabase-Client unter `@/lib/supabase/server`, Prisma-Client unter `@/lib/prisma`, Auth-Middleware) und Phase 2 (KundenProfile + BoxKonfiguration in DB) müssen implementiert sein.

---

## File Structure

```
src/
  lib/
    dal/
      konto.ts                    NEW — 5 Lese-Funktionen (je eine pro Seite)
  app/
    actions/
      konto.ts                    NEW — updateKundenBox() + createAnfrage()
    konto/
      page.tsx                    MODIFY — MOCK_KUNDEN → getKontoDashboard()
      meine-box/
        page.tsx                  MODIFY — Server Component, rendert BoxEditor
        box-editor.tsx            NEW — Client Component Wrapper um Konfigurator
      lieferungen/
        page.tsx                  MODIFY — MOCK_LIEFERUNGEN → getKundenLieferungen()
      anfragen/
        page.tsx                  MODIFY — Server Component, rendert AnfrageFormular
        anfrage-formular.tsx      NEW — Client Component für neue Anfrage
      einstellungen/
        page.tsx                  MODIFY — Server Component, rendert EinstellungenClient
        einstellungen-client.tsx  NEW — Client Component (Löschen-Dialog UI)
```

---

## Task 1: DAL — `src/lib/dal/konto.ts`

**Files:**
- Create: `src/lib/dal/konto.ts`

- [ ] **Step 1: Datei anlegen**

```typescript
// src/lib/dal/konto.ts
import { prisma } from '@/lib/prisma'

/** Dashboard: KundenProfile + nächste geplante Lieferung + Anzahl offener Anfragen */
export async function getKontoDashboard(userId: string) {
  return prisma.kundenProfile.findUnique({
    where: { user_id: userId },
    include: {
      box_konfiguration: true,
      lieferungen: {
        where:   { status: 'geplant' },
        orderBy: { geplant_fuer: 'asc' },
        take:    1,
      },
      anfragen: {
        where:  { status: 'offen' },
        select: { id: true },
      },
    },
  })
}

/** Meine Box: KundenProfile + BoxKonfiguration */
export async function getKundenBox(userId: string) {
  return prisma.kundenProfile.findUnique({
    where:   { user_id: userId },
    include: { box_konfiguration: true },
  })
}

/** Lieferungen: alle Lieferungen des Kunden, absteigend nach Datum */
export async function getKundenLieferungen(userId: string) {
  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: userId },
    select: { id: true },
  })
  if (!profile) return []
  return prisma.lieferung.findMany({
    where:   { kunde_id: profile.id },
    orderBy: { geplant_fuer: 'desc' },
  })
}

/** Anfragen: alle Anfragen des Kunden, absteigend nach Erstelldatum */
export async function getKundenAnfragen(userId: string) {
  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: userId },
    select: { id: true },
  })
  if (!profile) return []
  return prisma.anfrage.findMany({
    where:   { kunde_id: profile.id },
    orderBy: { erstellt_am: 'desc' },
  })
}

/** Einstellungen: Kontaktdaten (read-only in Phase 3) */
export async function getKundenEinstellungen(userId: string) {
  return prisma.kundenProfile.findUnique({
    where: { user_id: userId },
  })
}
```

- [ ] **Step 2: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler. Wenn `Cannot find module '@/lib/prisma'` erscheint → Phase 1 muss zuerst implementiert sein.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dal/konto.ts
git commit -m "feat: DAL konto — 5 Lese-Funktionen für Kundenportal"
```

---

## Task 2: Server Actions — `src/app/actions/konto.ts`

**Files:**
- Create: `src/app/actions/konto.ts`

- [ ] **Step 1: Datei anlegen**

```typescript
// src/app/actions/konto.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { BoxProdukt } from '@/lib/types'

/**
 * Speichert die neue Box-Konfiguration des eingeloggten Kunden.
 * WHERE nutzt immer `kunde_id: profile.id` (server-seitig, nie client-seitige ID).
 */
export async function updateKundenBox(produkte: BoxProdukt[]): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt.' }

  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: user.id },
    select: { id: true },
  })
  if (!profile) return { error: 'Kein Profil gefunden.' }

  // Ownership-Invariante: WHERE { kunde_id: profile.id } — nie eine client-seitige Box-ID
  // BoxProdukt.menge ist ein Varianten-String ("S"/"M"/"L"), keine numerische Menge →
  // gesamtpreis = Σ produkt.preis (ein Eintrag pro Produkt)
  const gesamtpreis = produkte.reduce((sum, bp) => sum + bp.produkt.preis, 0)

  await prisma.boxKonfiguration.update({
    where: { kunde_id: profile.id },
    data:  {
      produkte:    produkte as object,
      gesamtpreis,
    },
  })

  return {}
}

const BETREFF_MAP = {
  box:       'Anfrage: Box-Inhalt',
  lieferung: 'Anfrage: Lieferung',
  adresse:   'Anfrage: Adresse',
  sonstiges: 'Anfrage: Sonstiges',
} as const

type AnfrageKategorie = keyof typeof BETREFF_MAP

/** Legt eine neue Anfrage für den eingeloggten Kunden an. */
export async function createAnfrage(
  kategorie: AnfrageKategorie,
  nachricht: string,
): Promise<{ error?: string }> {
  if (nachricht.trim().length < 5) return { error: 'Nachricht zu kurz (min. 5 Zeichen).' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt.' }

  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: user.id },
    select: { id: true },
  })
  if (!profile) return { error: 'Kein Profil gefunden.' }

  await prisma.anfrage.create({
    data: {
      kunde_id:  profile.id,
      kategorie,
      betreff:   BETREFF_MAP[kategorie],
      nachricht: nachricht.trim(),
      status:    'offen',
    },
  })

  return {}
}
```

- [ ] **Step 2: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/konto.ts
git commit -m "feat: Server Actions konto — updateKundenBox + createAnfrage"
```

---

## Task 3: Dashboard — `src/app/konto/page.tsx`

**Files:**
- Modify: `src/app/konto/page.tsx`

**Hintergrund:** Die Seite ist bereits ein Server Component (kein `'use client'`). MOCK_KUNDEN[0] und MOCK_LIEFERUNGEN werden ersetzt.

`KundenProfile` hat keine zusammengesetzte `adresse`-Spalte — Adresse besteht aus `strasse`, `plz`, `ort`. Für das Dashboard brauchen wir das nicht.

- [ ] **Step 1: Seite ersetzen**

```typescript
// src/app/konto/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKontoDashboard } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

function KeinProfilHinweis() {
  return (
    <div className="bg-amber-pale border border-amber rounded-lg p-6">
      <p className="text-amber font-medium">Profil wird eingerichtet.</p>
      <p className="text-amber/70 text-sm mt-1">
        Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.
      </p>
    </div>
  )
}

export default async function KontoDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getKontoDashboard(user.id) : null

  if (!profile) return <KeinProfilHinweis />

  const produkte = (profile.box_konfiguration?.produkte as BoxProdukt[]) ?? []
  const gesamtwert = produkte.reduce((s, bp) => s + bp.produkt.preis, 0)
  const naechste = profile.lieferungen[0] ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">
          Guten Tag, {profile.vorname}!
        </h1>
        <p className="text-warm-gray text-sm">
          Pflegegrad {profile.pflegegrad} · {profile.krankenkasse}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Aktuelle Box
          </p>
          {produkte.length > 0 ? (
            <>
              <div className="space-y-1 mb-3">
                {produkte.map((bp, i) => (
                  <div key={i} className="text-sm text-dark">{bp.produkt.name}</div>
                ))}
              </div>
              <p className="text-xs text-warm-gray">
                {gesamtwert.toFixed(2).replace('.', ',')} € Gesamtwert
              </p>
            </>
          ) : (
            <p className="text-sm text-warm-gray">Noch keine Box konfiguriert.</p>
          )}
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Nächste Lieferung
          </p>
          {naechste ? (
            <>
              <p className="text-2xl font-serif font-semibold mb-1">
                {DE_DATUM.format(naechste.geplant_fuer)}
              </p>
              <Badge variant="sage">Geplant</Badge>
              <p className="text-xs text-warm-gray mt-2">
                Stichtag: {profile.lieferstichtag}. des Monats
              </p>
            </>
          ) : (
            <Badge variant="amber">Keine Lieferung geplant</Badge>
          )}
        </div>
      </div>

      {profile.anfragen.length > 0 && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">
            💬 {profile.anfragen.length} offene Anfrage(n)
          </p>
          <p className="text-amber/70 text-xs mt-1">
            Prüfen Sie Ihre Anfragen unter „Anfragen".
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 3: Manuell verifizieren**

```bash
npm run dev
```

Browser: `http://localhost:3001/konto` — eingeloggt als Testkunde:
- Begrüßung zeigt echten Vornamen aus DB
- Pflegegrad und Krankenkasse korrekt
- Aktuelle Box: Produkte aus BoxKonfiguration.produkte JSONB
- Nächste Lieferung: Datum aus Lieferung.geplant_fuer
- Kein `MOCK_KUNDEN` Import mehr in der Datei

- [ ] **Step 4: Commit**

```bash
git add src/app/konto/page.tsx
git commit -m "feat: konto dashboard — echte Daten via getKontoDashboard()"
```

---

## Task 4: Lieferungen — `src/app/konto/lieferungen/page.tsx`

**Files:**
- Modify: `src/app/konto/lieferungen/page.tsx`

**Hinweise:**
- Phase 1 `LieferungStatus` Enum: `geplant | in_bearbeitung | versendet | zugestellt | storniert`
- `box_snapshot` ist JSONB → cast zu `BoxProdukt[]` für Produktanzahl
- `gesamtwert` wird on-the-fly aus dem Snapshot berechnet (kein DB-Feld)
- Die vorhandene `Badge`-Variante `'sky'` bleibt für versendet/in_bearbeitung

- [ ] **Step 1: Seite ersetzen**

```typescript
// src/app/konto/lieferungen/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenLieferungen } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

const STATUS_LABEL: Record<string, string> = {
  geplant:        'Geplant',
  in_bearbeitung: 'In Bearbeitung',
  versendet:      'Versendet',
  zugestellt:     'Zugestellt',
  storniert:      'Storniert',
}

const STATUS_VARIANT: Record<string, 'amber' | 'sky' | 'sage' | 'gray'> = {
  geplant:        'amber',
  in_bearbeitung: 'sky',
  versendet:      'sky',
  zugestellt:     'sage',
  storniert:      'gray',
}

export default async function LieferungenPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const lieferungen = user ? await getKundenLieferungen(user.id) : []

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      {lieferungen.length === 0 ? (
        <p className="text-warm-gray text-sm">Noch keine Lieferungen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {lieferungen.map(l => {
            const snapshot = (l.box_snapshot as BoxProdukt[]) ?? []
            const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
            return (
              <div key={l.id}
                className="bg-warm-white rounded-lg border border-mid-gray p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{DE_DATUM.format(l.geplant_fuer)}</p>
                  <p className="text-xs text-warm-gray">
                    {snapshot.length} Produkte · {gesamtwert.toFixed(2).replace('.', ',')} €
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[l.status] ?? 'gray'}>
                  {STATUS_LABEL[l.status] ?? l.status}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 3: Manuell verifizieren**

Browser: `http://localhost:3001/konto/lieferungen`
- Liste zeigt echte Lieferungen aus DB (oder "Noch keine Lieferungen")
- Datum als deutsches Format (z.B. "15. April 2026")
- Status-Badge korrekt

- [ ] **Step 4: Commit**

```bash
git add src/app/konto/lieferungen/page.tsx
git commit -m "feat: konto lieferungen — echte Daten via getKundenLieferungen()"
```

---

## Task 5: Meine Box — BoxEditor + Page

**Files:**
- Create: `src/app/konto/meine-box/box-editor.tsx`
- Modify: `src/app/konto/meine-box/page.tsx`

**Hintergrund:** `page.tsx` wird von `'use client'` zum Server Component. Der gesamte Client-State und der `Konfigurator` wandern in `BoxEditor`. `Konfigurator` selbst bleibt **unverändert**.

`MOCK_PRODUKTE` bleibt die Produktkatalog-Quelle (Phase 4 bringt echte Produkte).

`BoxKonfiguration.produkte` (JSONB) wird als `BoxProdukt[]` gecastet. Die gespeicherten Produkt-IDs (p1, p2…) entsprechen `MOCK_PRODUKTE` — Kompatibilität sichergestellt.

- [ ] **Step 1: `box-editor.tsx` anlegen**

```typescript
// src/app/konto/meine-box/box-editor.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { MOCK_PRODUKTE } from '@/lib/mock-data'
import { updateKundenBox } from '@/app/actions/konto'
import type { BoxProdukt } from '@/lib/types'

interface BoxEditorProps {
  initialBox: BoxProdukt[]
}

export function BoxEditor({ initialBox }: BoxEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fehler, setFehler] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState(false)

  const handleSave = (box: BoxProdukt[]) => {
    setFehler(null)
    setGespeichert(false)
    startTransition(async () => {
      const result = await updateKundenBox(box)
      if (result.error) {
        setFehler(result.error)
      } else {
        setGespeichert(true)
        router.refresh()
        setTimeout(() => setGespeichert(false), 3000)
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Meine Box</h1>
          <p className="text-warm-gray text-sm">
            Änderungen gelten ab der nächsten Lieferung.
          </p>
        </div>
        {gespeichert && (
          <div className="bg-sage-pale text-sage text-sm px-4 py-2 rounded-lg border border-sage-light">
            ✓ Gespeichert
          </div>
        )}
        {fehler && (
          <div className="bg-danger-pale text-danger text-sm px-4 py-2 rounded-lg border border-danger/20">
            {fehler}
          </div>
        )}
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        initialBox={initialBox}
        onSave={handleSave}
        saveLabel={isPending ? 'Speichern...' : 'Änderungen speichern'}
      />
    </div>
  )
}
```

- [ ] **Step 2: `page.tsx` ersetzen**

```typescript
// src/app/konto/meine-box/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenBox } from '@/lib/dal/konto'
import { BoxEditor } from './box-editor'
import type { BoxProdukt } from '@/lib/types'

function KeinProfilHinweis() {
  return (
    <div className="bg-amber-pale border border-amber rounded-lg p-6">
      <p className="text-amber font-medium">Profil wird eingerichtet.</p>
      <p className="text-amber/70 text-sm mt-1">
        Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.
      </p>
    </div>
  )
}

export default async function MeineBoxPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const data = user ? await getKundenBox(user.id) : null

  if (!data) return <KeinProfilHinweis />

  const initialBox = (data.box_konfiguration?.produkte as BoxProdukt[]) ?? []

  return <BoxEditor initialBox={initialBox} />
}
```

- [ ] **Step 3: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 4: Manuell verifizieren**

Browser: `http://localhost:3001/konto/meine-box`
- Konfigurator lädt mit der gespeicherten Box aus DB als Ausgangszustand
- Produkt hinzufügen/entfernen → „Änderungen speichern" → ✓ Gespeichert erscheint
- Seite neu laden → Änderung bleibt erhalten (aus DB geladen)
- Kein `MOCK_KUNDEN` Import mehr in `page.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/app/konto/meine-box/page.tsx src/app/konto/meine-box/box-editor.tsx
git commit -m "feat: konto meine-box — echte BoxKonfiguration, updateKundenBox() Action"
```

---

## Task 6: Anfragen — AnfrageFormular + Page

**Files:**
- Create: `src/app/konto/anfragen/anfrage-formular.tsx`
- Modify: `src/app/konto/anfragen/page.tsx`

**Hintergrund:** `page.tsx` wird Server Component. Das Formular (inkl. State) wandert nach `anfrage-formular.tsx`. Nach erfolgreichem Senden: `router.refresh()` lädt die Anfragen-Liste neu (Server-Side-Render).

`AnfrageStatus` Enum (Phase 1): `offen | in_bearbeitung | beantwortet | geschlossen`. Anzeige-Logik: `offen` → amber Badge, alle anderen → sage Badge.

- [ ] **Step 1: `anfrage-formular.tsx` anlegen**

```typescript
// src/app/konto/anfragen/anfrage-formular.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createAnfrage } from '@/app/actions/konto'

type Kategorie = 'box' | 'lieferung' | 'adresse' | 'sonstiges'

const KATEGORIEN: { value: Kategorie; label: string }[] = [
  { value: 'box',       label: 'Box-Inhalt' },
  { value: 'lieferung', label: 'Lieferung' },
  { value: 'adresse',   label: 'Adresse' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export function AnfrageFormular() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [kat, setKat] = useState<Kategorie>('sonstiges')
  const [nachricht, setNachricht] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [gesendet, setGesendet] = useState(false)

  const handleSubmit = () => {
    setFehler(null)
    setGesendet(false)
    startTransition(async () => {
      const result = await createAnfrage(kat, nachricht)
      if (result.error) {
        setFehler(result.error)
      } else {
        setNachricht('')
        setGesendet(true)
        router.refresh()
        setTimeout(() => setGesendet(false), 3000)
      }
    })
  }

  return (
    <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
      <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
        Neue Anfrage
      </p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {KATEGORIEN.map(k => (
          <button key={k.value} onClick={() => setKat(k.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              kat === k.value
                ? 'bg-terra text-white border-terra'
                : 'border-mid-gray text-warm-gray hover:border-terra'
            }`}>
            {k.label}
          </button>
        ))}
      </div>
      <textarea
        value={nachricht}
        onChange={e => setNachricht(e.target.value)}
        placeholder="Ihre Nachricht an Velacare..."
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
      />
      {fehler && <p className="text-danger text-xs mt-2">{fehler}</p>}
      {gesendet && <p className="text-sage text-xs mt-2">✓ Anfrage gesendet</p>}
      <Button
        variant="primary"
        className="mt-3"
        onClick={handleSubmit}
        disabled={nachricht.trim().length < 5 || isPending}
      >
        {isPending ? 'Senden...' : 'Anfrage senden'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: `page.tsx` ersetzen**

```typescript
// src/app/konto/anfragen/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenAnfragen } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import { AnfrageFormular } from './anfrage-formular'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

const KAT_LABEL: Record<string, string> = {
  box:       'Box-Inhalt',
  lieferung: 'Lieferung',
  adresse:   'Adresse',
  sonstiges: 'Sonstiges',
}

export default async function AnfragenPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const anfragen = user ? await getKundenAnfragen(user.id) : []

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Anfragen</h1>
      <AnfrageFormular />
      <div className="space-y-3">
        {anfragen.map(a => (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="terra">{KAT_LABEL[a.kategorie] ?? a.kategorie}</Badge>
              <Badge variant={a.status === 'offen' ? 'amber' : 'sage'}>
                {a.status === 'offen' ? 'Offen' : 'Beantwortet'}
              </Badge>
            </div>
            <p className="text-sm mb-2">{a.nachricht}</p>
            {a.antwort && (
              <div className="bg-sage-pale rounded p-3 text-xs text-sage">
                <strong>Velacare:</strong> {a.antwort}
              </div>
            )}
            <p className="text-xs text-warm-gray mt-2">
              {DE_DATUM.format(a.erstellt_am)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 4: Manuell verifizieren**

Browser: `http://localhost:3001/konto/anfragen`
- Bestehende Anfragen aus DB werden angezeigt
- Neue Anfrage schreiben (min. 5 Zeichen) → „Anfrage senden" → ✓ Anfrage gesendet
- Liste aktualisiert sich automatisch (router.refresh) mit der neuen Anfrage
- Kein `MOCK_ANFRAGEN` Import mehr in `page.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/app/konto/anfragen/page.tsx src/app/konto/anfragen/anfrage-formular.tsx
git commit -m "feat: konto anfragen — echte Anfragen, createAnfrage() Action"
```

---

## Task 7: Einstellungen — EinstellungenClient + Page

**Files:**
- Create: `src/app/konto/einstellungen/einstellungen-client.tsx`
- Modify: `src/app/konto/einstellungen/page.tsx`

**Hintergrund:** `page.tsx` wird Server Component. Der Löschen-Dialog-State wandert nach `einstellungen-client.tsx`. Die Demo-Buttons (Passwort ändern, Account löschen) bleiben Demo — kein DB-Write.

`email` kommt aus `supabase.auth.getUser()`, **nicht** aus KundenProfile. Die Page übergibt sie als separate Prop.

`KundenProfile` hat keine kombinierte `adresse`-Spalte — Adresse wird aus `strasse + plz + ort` zusammengesetzt.

- [ ] **Step 1: `einstellungen-client.tsx` anlegen**

```typescript
// src/app/konto/einstellungen/einstellungen-client.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EinstellungenClientProps {
  vorname: string
  nachname: string
  email: string
  adresse: string       // zusammengesetzt: "Musterstr. 1, 12345 Berlin"
  krankenkasse: string
}

export function EinstellungenClient({
  vorname, nachname, email, adresse, krankenkasse,
}: EinstellungenClientProps) {
  const [loeschDialog, setLoeschDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Kontaktdaten
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-warm-gray">Name:</span><br />{vorname} {nachname}</div>
          <div><span className="text-warm-gray">E-Mail:</span><br />{email}</div>
          <div><span className="text-warm-gray">Adresse:</span><br />{adresse}</div>
          <div><span className="text-warm-gray">Krankenkasse:</span><br />{krankenkasse}</div>
        </div>
        <Button variant="secondary" className="text-xs">Daten ändern (Demo)</Button>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Passwort
        </p>
        <Button variant="secondary" className="text-xs">Passwort ändern (Demo)</Button>
      </div>

      <div className="bg-danger-pale rounded-lg border border-danger/20 p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-danger mb-2">
          Gefahrenzone
        </p>
        <p className="text-sm text-warm-gray mb-4">
          Ihr Account und alle Daten werden innerhalb von 30 Tagen gelöscht (DSGVO).
        </p>
        {!loeschDialog ? (
          <Button variant="danger" onClick={() => setLoeschDialog(true)}>
            Account löschen
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-danger">
              Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setLoeschDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="danger">
                Ja, Account löschen (Demo)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `page.tsx` ersetzen**

```typescript
// src/app/konto/einstellungen/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenEinstellungen } from '@/lib/dal/konto'
import { EinstellungenClient } from './einstellungen-client'

function KeinProfilHinweis() {
  return (
    <div className="bg-amber-pale border border-amber rounded-lg p-6">
      <p className="text-amber font-medium">Profil wird eingerichtet.</p>
      <p className="text-amber/70 text-sm mt-1">
        Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.
      </p>
    </div>
  )
}

export default async function EinstellungenPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getKundenEinstellungen(user.id) : null

  if (!profile || !user) return <KeinProfilHinweis />

  // Adresse aus einzelnen Feldern zusammensetzen
  const adresse = `${profile.strasse}, ${profile.plz} ${profile.ort}`

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold mb-6">Einstellungen</h1>
      <EinstellungenClient
        vorname={profile.vorname}
        nachname={profile.nachname}
        email={user.email ?? ''}
        adresse={adresse}
        krankenkasse={profile.krankenkasse}
      />
    </>
  )
}
```

- [ ] **Step 3: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Step 4: Manuell verifizieren**

Browser: `http://localhost:3001/konto/einstellungen`
- Name, E-Mail, Adresse, Krankenkasse zeigen echte Werte aus DB / Auth
- „Account löschen" öffnet Bestätigungs-Dialog → „Abbrechen" schließt ihn wieder
- Kein `MOCK_KUNDEN` Import mehr in `page.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/app/konto/einstellungen/page.tsx src/app/konto/einstellungen/einstellungen-client.tsx
git commit -m "feat: konto einstellungen — echte Kontaktdaten, EinstellungenClient"
```

---

## Abschluss-Check

Nach allen 7 Tasks:

- [ ] **Keine Mock-Importe mehr in `/konto/*`**

```bash
grep -r "MOCK_KUNDEN\|MOCK_LIEFERUNGEN\|MOCK_ANFRAGEN" src/app/konto/
```

Erwartete Ausgabe: keine Treffer.

- [ ] **`MOCK_PRODUKTE` nur noch im Konfigurator**

```bash
grep -r "MOCK_PRODUKTE" src/app/konto/
```

Erwartete Ausgabe: nur `src/app/konto/meine-box/box-editor.tsx` (korrekt — Produktkatalog bleibt Mock bis Phase 4).

- [ ] **Build grün**

```bash
npm run build
```

Erwartete Ausgabe: `✓ Compiled successfully`
