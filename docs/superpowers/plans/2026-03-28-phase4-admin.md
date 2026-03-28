# Phase 4 Admin-Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle 6 `/admin/*`-Seiten von statischen Mock-Daten auf echte Prisma-Datenbankdaten umstellen und minimales Produkt-CRUD aktivieren.

**Architecture:** Server Components laden Daten via DAL (`src/lib/dal/admin.ts`) und geben sie als Props weiter. Client Components (`ProdukteClient`, `AnfragenClient`) verwalten nur UI-State und rufen Server Actions auf. `requireAdmin()` prüft Authentication + Admin-Rolle in jeder Page und Action.

**Tech Stack:** Next.js 14 App Router · Prisma 5 · `@supabase/ssr` · TypeScript

**Abhängigkeit:** Phase 1 (Supabase, Prisma, Auth-Middleware) und Phase 2 (KundenProfile in DB) müssen abgeschlossen sein. Diese Tasks setzen voraus, dass `src/lib/prisma.ts` (Prisma Client Singleton) und `src/lib/supabase/server.ts` (`createClient`) bereits existieren.

---

## File Structure

```
src/
  lib/
    auth/
      require-admin.ts            NEW — requireAdmin() helper
    supabase/
      admin.ts                    NEW — createAdminClient() (Service Role)
    dal/
      admin.ts                    NEW — 6 Lese-Funktionen
  app/
    actions/
      admin.ts                    NEW — 4 Produkt-Server-Actions
    admin/
      page.tsx                    MODIFY — Dashboard → getAdminDashboard()
      kunden/
        page.tsx                  MODIFY — Kunden-Liste → getAdminKunden()
        [id]/
          page.tsx                MODIFY — Kunden-Detail → getAdminKundeDetail() + email
      lieferungen/
        page.tsx                  MODIFY — Lieferungen → getAdminLieferungen()
      anfragen/
        page.tsx                  MODIFY — Server Component, rendert AnfragenClient
        anfragen-client.tsx       NEW — Client Component (Demo-Antwort State)
      produkte/
        page.tsx                  MODIFY — Server Component, rendert ProdukteClient
        produkte-client.tsx       NEW — Client Component (Inline-Edit + Actions)
```

---

## Task 1: requireAdmin() helper

**Files:**
- Create: `src/lib/auth/require-admin.ts`

Schützt alle Admin-Pages und Admin-Server-Actions gegen direkte Aufrufe von nicht-Admin-Usern. Middleware schützt nur das Routing; diese Funktion schützt die Datenbank-Operationen.

- [ ] **Step 1: Datei anlegen**

```typescript
// src/lib/auth/require-admin.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/')
  return user
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler. Falls `createClient` nicht gefunden: Phase 1 muss zuerst implementiert sein.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/require-admin.ts
git commit -m "feat: add requireAdmin() helper for admin route/action protection"
```

---

## Task 2: Admin DAL

**Files:**
- Create: `src/lib/dal/admin.ts`

Alle Lese-Funktionen für die 6 Admin-Seiten. Kein `userId`-Filter — Admin sieht alle Datensätze.

- [ ] **Step 1: Datei anlegen**

```typescript
// src/lib/dal/admin.ts
import { prisma } from '@/lib/prisma'

// Dashboard: KPIs + neueste 5 Kunden
export async function getAdminDashboard() {
  const [aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden] =
    await prisma.$transaction([
      prisma.kundenProfile.count({ where: { lieferung_status: 'aktiv' } }),
      prisma.lieferung.count({ where: { status: 'geplant' } }),
      prisma.anfrage.count({ where: { status: 'offen' } }),
      prisma.kundenProfile.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: {
          id:               true,
          vorname:          true,
          nachname:         true,
          pflegegrad:       true,
          lieferung_status: true,
        },
      }),
    ])
  return { aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden }
}

// Kunden-Liste: alle KundenProfile, neueste zuerst
export async function getAdminKunden() {
  return prisma.kundenProfile.findMany({
    orderBy: { id: 'desc' },
    select: {
      id:               true,
      vorname:          true,
      nachname:         true,
      pflegegrad:       true,
      krankenkasse:     true,
      lieferung_status: true,
    },
  })
}

// Kunden-Detail: Stammdaten + Box + Lieferungen
export async function getAdminKundeDetail(profilId: string) {
  return prisma.kundenProfile.findUnique({
    where:   { id: profilId },
    include: {
      box_konfiguration: true,
      lieferungen: { orderBy: { geplant_fuer: 'desc' } },
    },
  })
}

// Lieferungen: alle Lieferungen + Kundenname
export async function getAdminLieferungen() {
  return prisma.lieferung.findMany({
    orderBy: { geplant_fuer: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })
}

// Anfragen: alle Anfragen + Kundenname
export async function getAdminAnfragen() {
  return prisma.anfrage.findMany({
    orderBy: { erstellt_am: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })
}

// Produkte: alle Produkte, alphabetisch
export async function getAdminProdukte() {
  return prisma.produkt.findMany({ orderBy: { name: 'asc' } })
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler. Falls Prisma-Modelle nicht gefunden: Phase 1 Schema muss migriert sein.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dal/admin.ts
git commit -m "feat: add admin DAL with 6 read functions"
```

---

## Task 3: Admin Server Actions

**Files:**
- Create: `src/app/actions/admin.ts`

4 Schreib-Operationen für Produkte. Jede Action ruft zuerst `requireAdmin()` auf.

- [ ] **Step 1: Datei anlegen**

```typescript
// src/app/actions/admin.ts
'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function createProdukt(): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.produkt.create({
      data: {
        name:         'Neues Produkt',
        preis:        5.00,
        kategorie:    'Sonstiges',
        beschreibung: 'Beschreibung',
        bild_url:     '',
        hersteller:   '—',
        aktiv:        true,
      },
    })
    return {}
  } catch {
    return { error: 'Produkt konnte nicht erstellt werden.' }
  }
}

export async function updateProduktName(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    if (name.trim().length < 1) return { error: 'Name darf nicht leer sein.' }
    await prisma.produkt.update({ where: { id }, data: { name: name.trim() } })
    return {}
  } catch {
    return { error: 'Name konnte nicht aktualisiert werden.' }
  }
}

export async function toggleProduktAktiv(
  id: string,
  aktiv: boolean,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.produkt.update({ where: { id }, data: { aktiv } })
    return {}
  } catch {
    return { error: 'Status konnte nicht geändert werden.' }
  }
}

export async function deleteProdukt(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.produkt.delete({ where: { id } })
    return {}
  } catch {
    return { error: 'Produkt konnte nicht gelöscht werden.' }
  }
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/admin.ts
git commit -m "feat: add admin server actions for product CRUD"
```

---

## Task 4: Admin Dashboard

**Files:**
- Modify: `src/app/admin/page.tsx`

Ersetzt `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN` durch `getAdminDashboard()`. Zeigt echte KPI-Zahlen und die neuesten 5 Kunden (statt alle Mock-Kunden). Email entfällt in der Liste.

- [ ] **Step 1: page.tsx ersetzen**

```typescript
// src/app/admin/page.tsx
import { getAdminDashboard } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireAdmin()
  const { aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden } =
    await getAdminDashboard()

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktive Kunden',       wert: aktiveKunden,       farbe: 'text-terra' },
          { label: 'Geplante Lieferungen', wert: geplanteLieferungen, farbe: 'text-sky'  },
          { label: 'Offene Anfragen',      wert: offeneAnfragen,     farbe: 'text-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
              {kpi.label}
            </p>
            <p className={`font-serif text-4xl font-semibold ${kpi.farbe}`}>{kpi.wert}</p>
          </div>
        ))}
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray flex justify-between items-center">
          <p className="text-sm font-medium">Neueste Kunden</p>
          <Link href="/admin/kunden" className="text-xs text-terra hover:underline">
            Alle ansehen →
          </Link>
        </div>
        {neuesteKunden.map(k => (
          <Link
            key={k.id}
            href={`/admin/kunden/${k.id}`}
            className="flex items-center justify-between px-5 py-3 border-b border-mid-gray last:border-none hover:bg-bg transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{k.vorname} {k.nachname}</p>
              <p className="text-xs text-warm-gray">PG {k.pflegegrad}</p>
            </div>
            <Badge variant={
              k.lieferung_status === 'aktiv'    ? 'sage'  :
              k.lieferung_status === 'pausiert' ? 'amber' : 'gray'
            }>
              {k.lieferung_status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler, keine Imports mehr auf `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN`.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: admin dashboard shows real KPIs from database"
```

---

## Task 5: Kunden-Liste

**Files:**
- Modify: `src/app/admin/kunden/page.tsx`

Ersetzt `MOCK_KUNDEN` durch `getAdminKunden()`. E-Mail-Spalte entfällt (Admin-API-Call pro Row wäre zu teuer — Email nur auf der Detail-Seite). Link-URL bleibt `k.id`, jetzt aber UUID statt Mock-String.

- [ ] **Step 1: page.tsx ersetzen**

```typescript
// src/app/admin/kunden/page.tsx
import Link from 'next/link'
import { getAdminKunden } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'

export default async function KundenListePage() {
  await requireAdmin()
  const kunden = await getAdminKunden()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Kunden</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-mid-gray">
            <tr>
              {['Name', 'Pflegegrad', 'Krankenkasse', 'Status', ''].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium tracking-widest uppercase text-warm-gray"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kunden.map(k => (
              <tr
                key={k.id}
                className="border-b border-mid-gray last:border-none hover:bg-bg transition-colors"
              >
                <td className="px-4 py-3 font-medium">{k.vorname} {k.nachname}</td>
                <td className="px-4 py-3">PG {k.pflegegrad}</td>
                <td className="px-4 py-3 text-warm-gray">{k.krankenkasse}</td>
                <td className="px-4 py-3">
                  <Badge variant={
                    k.lieferung_status === 'aktiv'    ? 'sage'  :
                    k.lieferung_status === 'pausiert' ? 'amber' : 'gray'
                  }>
                    {k.lieferung_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/kunden/${k.id}`} className="text-terra text-xs hover:underline">
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/kunden/page.tsx
git commit -m "feat: admin kunden list shows real data, email column removed"
```

---

## Task 6: Supabase Admin Client + Kunden-Detail

**Files:**
- Create: `src/lib/supabase/admin.ts`
- Modify: `src/app/admin/kunden/[id]/page.tsx`

Erstellt den Service-Role-Client für die Admin API. Lädt Stammdaten aus Prisma + Email einmalig via `getUserById`. Adressfelder (`strasse`, `plz`, `ort`) werden zu einem String zusammengesetzt — im Mock war das ein einzelnes `adresse`-Feld.

- [ ] **Step 1: Supabase Admin Client anlegen**

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// Service Role Client — nur serverseitig verwenden, nie an den Client weitergeben
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

`SUPABASE_SERVICE_ROLE_KEY` muss in `.env.local` gesetzt sein (aus dem Supabase Dashboard unter Settings → API).

- [ ] **Step 2: Kunden-Detail page.tsx ersetzen**

```typescript
// src/app/admin/kunden/[id]/page.tsx
import { getAdminKundeDetail } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { BoxProdukt } from '@/lib/types'

const fmt = new Intl.DateTimeFormat('de-DE')

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const profile = await getAdminKundeDetail(id)
  if (!profile) notFound()

  // Email einmalig via Service Role laden (akzeptabler Overhead bei Einzelaufruf)
  const adminClient = createAdminClient()
  const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(
    profile.user_id,
  )
  const email = authUser?.email ?? '—'

  // box_konfiguration.produkte ist JSONB → als BoxProdukt[] casten
  const box = (profile.box_konfiguration?.produkte ?? []) as BoxProdukt[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kunden" className="text-xs text-warm-gray hover:text-dark">
          ← Zurück
        </Link>
        <h1 className="font-serif text-3xl font-semibold">
          {profile.vorname} {profile.nachname}
        </h1>
        <Badge variant={profile.lieferung_status === 'aktiv' ? 'sage' : 'amber'}>
          {profile.lieferung_status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Stammdaten
          </p>
          <dl className="space-y-2 text-sm">
            {(
              [
                ['E-Mail',       email],
                ['Pflegegrad',   `PG ${profile.pflegegrad}`],
                ['Adresse',      `${profile.strasse}, ${profile.plz} ${profile.ort}`],
                ['Krankenkasse', profile.krankenkasse],
                ['Lieferstichtag', `${profile.lieferstichtag}. des Monats`],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="text-warm-gray w-28 flex-shrink-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Aktuelle Box
          </p>
          {box.length > 0 ? (
            <div className="space-y-1">
              {box.map(item => (
                <div key={item.produkt.id} className="flex justify-between text-sm">
                  <span>{item.produkt.name}</span>
                  <span className="text-terra">
                    {item.produkt.preis.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-gray">Keine Box konfiguriert.</p>
          )}
        </div>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray">
          <p className="text-sm font-medium">Lieferungen</p>
        </div>
        {profile.lieferungen.map(l => {
          // box_snapshot ist JSONB → als BoxProdukt[] casten
          const snapshot = (l.box_snapshot ?? []) as BoxProdukt[]
          // BoxProdukt.menge ist ein Varianten-String ("S"/"M"/"L"), keine numerische Menge
          const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
          return (
            <div
              key={l.id}
              className="flex justify-between items-center px-5 py-3 border-b border-mid-gray last:border-none"
            >
              <span className="text-sm">{fmt.format(l.geplant_fuer)}</span>
              <span className="text-sm text-warm-gray">
                {gesamtwert.toFixed(2).replace('.', ',')} € · {snapshot.length} Produkte
              </span>
              <Badge variant={
                l.status === 'zugestellt' ? 'sage'  :
                l.status === 'geplant'    ? 'amber' : 'sky'
              }>
                {l.status}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler. `strasse`, `plz`, `ort` müssen im Prisma-Schema als Felder auf `KundenProfile` existieren (Phase 1).

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/admin.ts src/app/admin/kunden/[id]/page.tsx
git commit -m "feat: admin kunden detail loads real data + email via service role"
```

---

## Task 7: Lieferungen

**Files:**
- Modify: `src/app/admin/lieferungen/page.tsx`

Ersetzt `MOCK_LIEFERUNGEN`/`MOCK_KUNDEN` durch `getAdminLieferungen()`. Datum aus `geplant_fuer` (Date → DE-Format). Gesamtwert aus `box_snapshot` berechnet.

- [ ] **Step 1: page.tsx ersetzen**

```typescript
// src/app/admin/lieferungen/page.tsx
import { getAdminLieferungen } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const fmt = new Intl.DateTimeFormat('de-DE')

export default async function LieferungenAdminPage() {
  await requireAdmin()
  const lieferungen = await getAdminLieferungen()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {lieferungen.map(l => {
          // box_snapshot ist JSONB → als BoxProdukt[] casten
          const snapshot = (l.box_snapshot ?? []) as BoxProdukt[]
          // BoxProdukt.menge ist ein Varianten-String, keine numerische Menge
          const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
          return (
            <div
              key={l.id}
              className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none"
            >
              <div>
                <p className="text-sm font-medium">
                  {l.kunde.vorname} {l.kunde.nachname}
                </p>
                <p className="text-xs text-warm-gray">
                  {fmt.format(l.geplant_fuer)} · {gesamtwert.toFixed(2).replace('.', ',')} € · {snapshot.length} Produkte
                </p>
              </div>
              <Badge variant={
                l.status === 'zugestellt' ? 'sage'  :
                l.status === 'geplant'    ? 'amber' : 'sky'
              }>
                {l.status}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler, keine `MOCK_LIEFERUNGEN`-Imports mehr.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/lieferungen/page.tsx
git commit -m "feat: admin lieferungen shows real data from database"
```

---

## Task 8: AnfragenClient + Anfragen-Page

**Files:**
- Create: `src/app/admin/anfragen/anfragen-client.tsx`
- Modify: `src/app/admin/anfragen/page.tsx`

Die bestehende `'use client'` Page wird zur Server Component (lädt echte Anfragen). Der Demo-Antwort-State wird in `AnfragenClient` ausgelagert. Kein DB-Write — Demo-Button bleibt Demo. `erstellt_am` ist ein `Date`-Objekt in Prisma, wird bei der Serialisierung zu einem ISO-String → `new Date(a.erstellt_am)` im Client.

- [ ] **Step 1: AnfragenClient anlegen**

```typescript
// src/app/admin/anfragen/anfragen-client.tsx
'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Next.js serialisiert Date zu ISO-String; Date | string deckt beide Seiten ab
interface AnfrageItem {
  id:          string
  kategorie:   string
  nachricht:   string
  status:      string
  antwort:     string | null
  erstellt_am: Date | string
  kunde: { vorname: string; nachname: string }
}

const fmt = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' })

export function AnfragenClient({ anfragen }: { anfragen: AnfrageItem[] }) {
  const [antworten,    setAntworten]    = useState<Record<string, string>>({})
  const [beantwortet,  setBeantwortet]  = useState<Set<string>>(new Set())

  return (
    <div className="space-y-4">
      {anfragen.map(a => {
        const istBeantwortet = beantwortet.has(a.id) || a.status === 'beantwortet'
        return (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium">
                  {a.kunde.vorname} {a.kunde.nachname}
                </p>
                <p className="text-xs text-warm-gray">
                  {fmt.format(new Date(a.erstellt_am))}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="terra">{a.kategorie}</Badge>
                <Badge variant={istBeantwortet ? 'sage' : 'amber'}>
                  {istBeantwortet ? 'beantwortet' : 'offen'}
                </Badge>
              </div>
            </div>
            <p className="text-sm bg-bg rounded p-3 mb-3">{a.nachricht}</p>
            {a.antwort && (
              <p className="text-xs text-sage bg-sage-pale rounded p-2 mb-3">
                <strong>Antwort:</strong> {a.antwort}
              </p>
            )}
            {!istBeantwortet && (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Antwort eingeben..."
                  value={antworten[a.id] ?? ''}
                  onChange={e =>
                    setAntworten(prev => ({ ...prev, [a.id]: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
                />
                <Button
                  variant="primary"
                  className="text-xs"
                  onClick={() =>
                    setBeantwortet(prev => {
                      const next = new Set(prev)
                      next.add(a.id)
                      return next
                    })
                  }
                >
                  Antwort senden (Demo)
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: page.tsx ersetzen (Server Component)**

```typescript
// src/app/admin/anfragen/page.tsx
import { getAdminAnfragen } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AnfragenClient } from './anfragen-client'

export default async function AnfragenAdminPage() {
  await requireAdmin()
  const anfragen = await getAdminAnfragen()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Anfragen</h1>
      <AnfragenClient anfragen={anfragen} />
    </div>
  )
}
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler, kein `'use client'` in page.tsx, kein `MOCK_ANFRAGEN`-Import.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/anfragen/anfragen-client.tsx src/app/admin/anfragen/page.tsx
git commit -m "feat: admin anfragen loads real data, extracts AnfragenClient"
```

---

## Task 9: ProdukteClient + Produkte-Page

**Files:**
- Create: `src/app/admin/produkte/produkte-client.tsx`
- Modify: `src/app/admin/produkte/page.tsx`

Ersetzt `useMockStore` durch echte Server Actions. `useTransition` + `isPending` sperrt Buttons während Mutations. Confirm-Dialog vor Delete verhindert versehentliches Löschen. `router.refresh()` nach jedem erfolgreichen Write lädt frische Daten vom Server.

- [ ] **Step 1: ProdukteClient anlegen**

```typescript
// src/app/admin/produkte/produkte-client.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  createProdukt,
  updateProduktName,
  toggleProduktAktiv,
  deleteProdukt,
} from '@/app/actions/admin'

interface ProduktItem {
  id:       string
  name:     string
  kategorie: string
  preis:    number
  aktiv:    boolean
}

export function ProdukteClient({ produkte }: { produkte: ProduktItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId,         setEditId]         = useState<string | null>(null)
  const [neuerName,      setNeuerName]       = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [fehler,         setFehler]          = useState<string | null>(null)

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setFehler(null)
      const result = await action()
      if (result.error) setFehler(result.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="primary"
          className="text-xs"
          disabled={isPending}
          onClick={() => run(createProdukt)}
        >
          + Produkt hinzufügen
        </Button>
      </div>

      {fehler && <p className="text-red-600 text-sm mb-4">{fehler}</p>}

      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {produkte.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none"
          >
            <div className="flex-1">
              {editId === p.id ? (
                <input
                  className="border border-terra rounded px-2 py-1 text-sm w-full max-w-xs"
                  value={neuerName}
                  onChange={e => setNeuerName(e.target.value)}
                  onBlur={() => {
                    run(() => updateProduktName(p.id, neuerName))
                    setEditId(null)
                  }}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium">{p.name}</p>
              )}
              <p className="text-xs text-warm-gray">
                {p.kategorie} · {p.preis.toFixed(2).replace('.', ',')} €
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={p.aktiv ? 'sage' : 'gray'}>
                {p.aktiv ? 'Aktiv' : 'Deaktiviert'}
              </Badge>

              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                disabled={isPending}
                onClick={() => { setEditId(p.id); setNeuerName(p.name) }}
              >
                Bearbeiten
              </Button>

              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                disabled={isPending}
                onClick={() => run(() => toggleProduktAktiv(p.id, !p.aktiv))}
              >
                {p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
              </Button>

              {confirmDeleteId === p.id ? (
                <>
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1"
                    disabled={isPending}
                    onClick={() => {
                      run(() => deleteProdukt(p.id))
                      setConfirmDeleteId(null)
                    }}
                  >
                    Sicher löschen
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs px-2 py-1"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Abbrechen
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  className="text-xs px-2 py-1"
                  disabled={isPending}
                  onClick={() => setConfirmDeleteId(p.id)}
                >
                  Löschen
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: page.tsx ersetzen (Server Component)**

```typescript
// src/app/admin/produkte/page.tsx
import { getAdminProdukte } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ProdukteClient } from './produkte-client'

export default async function ProdukteAdminPage() {
  await requireAdmin()
  const produkte = await getAdminProdukte()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Produkte</h1>
      <ProdukteClient produkte={produkte} />
    </div>
  )
}
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler, kein `useMockStore`-Import mehr in `/admin/produkte`.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/produkte/produkte-client.tsx src/app/admin/produkte/page.tsx
git commit -m "feat: admin produkte uses real DB CRUD via server actions"
```

---

## Abschlusskontrolle

Nach allen 9 Tasks:

- [ ] Keine `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN`, `MOCK_PRODUKTE`-Imports mehr in `/src/app/admin/*`
- [ ] `useMockStore` wird nicht mehr von `/admin/produkte` importiert
- [ ] `npm run build` läuft fehlerfrei durch
- [ ] Im Browser (nach Supabase/Prisma-Setup): Admin-Login → Dashboard zeigt echte KPIs
