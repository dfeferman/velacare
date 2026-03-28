# Velacare Phase 4 — Admin-Panel (Echte Daten)

> **Entstehung:** Skill: superpowers:brainstorming
> **Datum:** 28. März 2026
> **Status:** Approved

---

## Ziel

Die 6 bestehenden `/admin/*`-Seiten von statischen Mock-Daten auf echte Prisma-Datenbankdaten umstellen. Zusätzlich werden die Produkte-Schreiboperationen aktiviert (minimales CRUD). Die bestehende UI bleibt weitgehend unverändert — Phase 4 ist primär ein Datenlayer-Austausch.

**Abhängigkeit:** Phase 1 (Supabase, Prisma, Auth-Middleware) und Phase 2 (KundenProfile in DB) müssen abgeschlossen sein.

---

## Scope

**In Phase 4:**
- Alle 6 `/admin/*`-Seiten zeigen echte Daten aus Prisma
- Produkte: Name inline bearbeiten, aktivieren/deaktivieren, löschen, hinzufügen (mit Defaults)
- Kunden-Detail: E-Mail via Supabase Admin API (Service Role)

**Nicht in Phase 4:**
- Anfragen beantworten (→ Phase 5 oder später; Demo-Button bleibt)
- Lieferung-Status ändern (→ spätere Phase)
- Vollständiges Produkt-Formular mit allen Feldern (→ spätere Phase)
- Kunden-Status ändern (→ spätere Phase)
- Lieferungen manuell anlegen (→ spätere Phase)

---

## Architektur

```
Browser
  ↓
/admin/* Server Components
  ↓  requireAdmin()  ← prüft Authentication + Admin-Rolle
  ↓
src/lib/dal/admin.ts      ← 6 Lese-Funktionen (eine pro Seite)
src/app/actions/admin.ts  ← 4 Produkt-Write-Actions (rufen requireAdmin() auf)
  ↓
Prisma → Supabase PostgreSQL
```

**Kerntrennung:**
- Server Components laden Daten → geben als Props weiter
- Client Components nur wo State nötig (Produkte Inline-Edit, Anfragen Demo-Antwort)
- DAL-Funktionen brauchen kein `userId` — Admin sieht alle Daten (kein Row-Level-Filter)
- Kein `useEffect`, kein Browser-Fetch für Datenbankdaten

**`requireAdmin()` — `src/lib/auth/require-admin.ts`:**

```typescript
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

- Wird in jedem `/admin/*` Server Component aufgerufen (vor DAL-Call)
- Wird in jeder Admin Server Action aufgerufen (vor DB-Write)
- DAL-Funktionen selbst rufen es **nicht** auf — sie sind rein datenbanknahe Hilfsfunktionen
- `app_metadata.role` wird über Supabase Dashboard oder Service Role gesetzt (nicht vom User änderbar)

---

## Data Access Layer: `src/lib/dal/admin.ts`

Eine Funktion pro Seite. Keine `userId`-Filter — Admin sieht alle Datensätze.

```typescript
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
        select: { id: true, vorname: true, nachname: true, pflegegrad: true, lieferung_status: true },
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

**Null-Handling:** `getAdminKundeDetail` kann `null` zurückgeben (UUID nicht gefunden → `notFound()` in der Page).

---

## Server Actions: `src/app/actions/admin.ts`

Jede Action ruft als ersten Schritt `requireAdmin()` auf — schützt gegen direkte Action-Aufrufe ohne Middleware.

### `createProdukt()`

```
1. requireAdmin()
2. Produkt.create mit Defaults:
   name: 'Neues Produkt', preis: 5.00, kategorie: 'Sonstiges',
   beschreibung: 'Beschreibung', bild_url: '', hersteller: '—', aktiv: true
3. Gibt { error?: string } zurück
```

### `updateProduktName(id: string, name: string)`

```
1. requireAdmin()
2. Validation: name.trim().length >= 1
3. Produkt.update({ where: { id }, data: { name: name.trim() } })
4. Gibt { error?: string } zurück
```

### `toggleProduktAktiv(id: string, aktiv: boolean)`

```
1. requireAdmin()
2. Produkt.update({ where: { id }, data: { aktiv } })
3. Gibt { error?: string } zurück
```

### `deleteProdukt(id: string)`

```
1. requireAdmin()
2. Produkt.delete({ where: { id } })
3. Gibt { error?: string } zurück
```

**Fehlerbehandlung:** Bei fehlgeschlagenen Writes gibt die Action `{ error: '...' }` zurück. Das Client Component zeigt die Fehlermeldung inline.

---

## Seiten-Änderungen

### `/admin` — Dashboard

**Wird:** Server Component (bereits, kein `'use client'`)
**Änderung:** Ersetzt `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN` durch `getAdminDashboard()`.

Zeigt:
- KPI-Karten: `aktiveKunden`, `geplanteLieferungen`, `offeneAnfragen`
- Neueste Kunden: `neuesteKunden` mit Link auf `/admin/kunden/${profile.id}`

### `/admin/kunden` — Kunden-Liste

**Wird:** Server Component (bereits)
**Änderung:** Ersetzt `MOCK_KUNDEN` durch `getAdminKunden()`.

| Mock-Feld | DB-Feld |
|---|---|
| `k.id` | `k.id` (UUID — für Link-URL) |
| `k.vorname`, `k.nachname` | identisch |
| `k.email` | **nicht in Liste** (kein Admin-API-Call pro Row) |
| `k.pflegegrad` | identisch |
| `k.krankenkasse` | identisch |
| `k.status` | `k.lieferung_status` |

**E-Mail in der Liste entfällt** — Admin-API-Call pro Row wäre zu teuer. E-Mail nur auf Detail-Seite.

### `/admin/kunden/[id]` — Kunden-Detail

**Wird:** Server Component (bereits async)
**Änderung:** Ersetzt Mock-Lookup durch `getAdminKundeDetail(id)`. URL-Parameter ist jetzt `KundenProfile.id` (UUID).

E-Mail: wird via `createAdminClient().auth.admin.getUserById(profile.user_id)` geladen (Service Role — nur einmal pro Detail-Aufruf, akzeptabler Overhead).

Zeigt:
- Stammdaten: vorname, nachname, email (Auth), pflegegrad, `strasse + plz + ort`, krankenkasse, lieferstichtag
- Aktuelle Box: `profile.box_konfiguration.produkte` als `BoxProdukt[]`
- Lieferungen-Liste: `geplant_fuer` (DE-Datum) + status + Anzahl Produkte

### `/admin/lieferungen` — Lieferungen

**Wird:** Server Component (bereits)
**Änderung:** Ersetzt Mock-Lookup durch `getAdminLieferungen()`.

| Mock-Feld | DB-Feld |
|---|---|
| `kunde?.vorname + nachname` | `l.kunde.vorname + nachname` |
| `l.datum` | `l.geplant_fuer` (Date → `Intl.DateTimeFormat('de-DE')`) |
| `l.gesamtwert` | aus `box_snapshot` berechnet |
| `l.boxSnapshot.length` | `(l.box_snapshot as BoxProdukt[]).length` |
| `l.status` | `LieferungStatus` Enum |

### `/admin/anfragen` — Anfragen

**Wird:** Server Component (Datenladen) + `<AnfragenClient>` Client Component

```
page.tsx (Server Component)
  → getAdminAnfragen()
  → <AnfragenClient anfragen={...} /> (Client Component)

AnfragenClient
  → Zeigt Anfragen-Liste mit Kundennamen
  → Textarea + "Antwort senden (Demo)" — bleibt Demo, kein DB-Write
  → useState für Demo-Antwort-State (wie bisher)
```

### `/admin/produkte` — Produkte

**Wird:** Server Component (Datenladen) + `<ProdukteClient>` Client Component

```
page.tsx (Server Component)
  → getAdminProdukte()
  → <ProdukteClient produkte={...} /> (Client Component)

ProdukteClient
  → Inline-Edit (Name), Toggle, Löschen, Hinzufügen
  → useTransition für alle 4 Server Actions
  → router.refresh() nach erfolgreichem Write
```

---

## Neue Dateien

```
src/
  lib/
    auth/
      require-admin.ts            NEW — requireAdmin() Helper
    dal/
      admin.ts                    NEW — 6 Lese-Funktionen
  app/
    actions/
      admin.ts                    NEW — 4 Produkt-Server-Actions
    admin/
      anfragen/
        anfragen-client.tsx       NEW — Client Component (Demo-Antwort State)
      produkte/
        produkte-client.tsx       NEW — Client Component (Inline-Edit + Actions)
```

## Geänderte Dateien

```
src/app/admin/page.tsx                  MODIFY — echte KPIs via getAdminDashboard()
src/app/admin/kunden/page.tsx           MODIFY — echte Kundenliste
src/app/admin/kunden/[id]/page.tsx      MODIFY — echtes KundenDetail + E-Mail via Admin API
src/app/admin/lieferungen/page.tsx      MODIFY — echte Lieferungen
src/app/admin/anfragen/page.tsx         MODIFY — Server Component, rendert AnfragenClient
src/app/admin/produkte/page.tsx         MODIFY — Server Component, rendert ProdukteClient
```

---

## Keine Prisma-Migration nötig

Phase 4 verwendet ausschließlich das bestehende Phase-1-Schema. Keine neuen Felder oder Tabellen.

---

## Lieferergebnis Phase 4

Nach Abschluss ist folgendes funktionsfähig:

- [ ] Dashboard zeigt echte KPIs aus DB
- [ ] Kunden-Liste zeigt alle echten KundenProfile
- [ ] Kunden-Detail zeigt echte Stammdaten, Box, Lieferungen + E-Mail aus Auth
- [ ] Lieferungen-Seite zeigt echte Lieferhistorie
- [ ] Anfragen zeigt echte Anfragen (read-only)
- [ ] Produkte: Add, Name-Edit, Toggle, Delete arbeiten gegen echte DB
- [ ] Kein `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN`, `MOCK_PRODUKTE` mehr in `/admin/*`
- [ ] `useMockStore` wird nicht mehr von `/admin/produkte` genutzt
