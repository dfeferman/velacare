# Velacare Phase 3 — Kundenportal (Echte Daten)

> **Entstehung:** Skill: superpowers:brainstorming
> **Datum:** 28. März 2026
> **Status:** Approved

---

## Ziel

Die 5 bestehenden `/konto/*`-Seiten von statischen Mock-Daten auf echte Prisma-Datenbankdaten umstellen. Zusätzlich werden zwei Schreib-Operationen aktiviert: Box-Änderungen speichern und neue Anfragen senden. Die bestehende UI bleibt unverändert — Phase 3 ist ein reiner Datenlayer-Austausch.

**Abhängigkeit:** Phase 1 (Supabase-Verbindung, Prisma-Schema, Auth-Middleware) und Phase 2 (Registrierungsfunnel, echte Kundendaten in DB) müssen abgeschlossen sein.

---

## Scope

**In Phase 3:**
- Alle 5 `/konto/*`-Seiten zeigen echte Daten aus Prisma
- Box-Änderungen speichern (`BoxKonfiguration` updaten)
- Neue Anfragen senden (`Anfrage` in DB schreiben)
- Einstellungsseite zeigt echte Kontaktdaten (read-only)

**Nicht in Phase 3:**
- `BoxKonfigurationVerlauf` beim Box-Update (→ Phase 4)
- Benachrichtigungen anzeigen (→ Phase 5)
- Kontaktdaten ändern (→ spätere Phase)
- Account löschen — Löschen-Dialog bleibt als Demo-UI, kein DB-Write (→ Phase 6)
- Lieferung pausieren/reaktivieren (→ spätere Phase)
- Echte Produkte aus DB (Produktkatalog bleibt `MOCK_PRODUKTE` — Phase 4 bringt echte Produktverwaltung)
- Passwort ändern (→ Phase 6 oder Phase 5)

---

## Architektur

```
Browser
  ↓
/konto/* Server Components
  ↓  supabase.auth.getUser() → userId  (Defense in Depth, Middleware schützt Routing bereits)
  ↓
src/lib/dal/konto.ts       ← alle Lese-Funktionen (Prisma)
src/app/actions/konto.ts   ← 2 Server Actions (Schreib-Operationen)
  ↓
Prisma → Supabase PostgreSQL
```

**Kerntrennung:**
- Server Components laden Daten → geben als Props weiter
- Client Components verwalten nur lokalen UI-State und rufen Server Actions auf
- Kein `useEffect`, kein fetch im Browser für Datenbankdaten

---

## Data Access Layer: `src/lib/dal/konto.ts`

Eine Funktion pro Seite. Alle Funktionen nehmen `userId: string` (Supabase Auth UID).

```typescript
import { prisma } from '@/lib/prisma'

// Dashboard: KundenProfile + nächste geplante Lieferung + Anzahl offener Anfragen
export async function getKontoDashboard(userId: string) {
  return prisma.kundenProfile.findUnique({
    where: { user_id: userId },
    include: {
      box_konfiguration: true,
      lieferungen: {
        where:    { status: 'geplant' },
        orderBy:  { geplant_fuer: 'asc' },
        take:     1,
      },
      anfragen: {
        where:  { status: 'offen' },
        select: { id: true },
      },
    },
  })
}

// Meine Box: KundenProfile + BoxKonfiguration (JSONB-Snapshot)
export async function getKundenBox(userId: string) {
  return prisma.kundenProfile.findUnique({
    where:   { user_id: userId },
    include: { box_konfiguration: true },
  })
}

// Lieferungen: alle Lieferungen des Kunden, absteigend
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

// Anfragen: alle Anfragen des Kunden, absteigend
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

// Einstellungen: Kontaktdaten (read-only in Phase 3)
export async function getKundenEinstellungen(userId: string) {
  return prisma.kundenProfile.findUnique({
    where: { user_id: userId },
  })
}
```

**Null-Handling:** Alle Funktionen können `null` zurückgeben (kein KundenProfile vorhanden — z.B. wenn E-Mail noch nicht bestätigt wurde). Seiten rendern einen `<KeinProfilFehler>`-Hinweis in diesem Fall.

---

## Server Actions: `src/app/actions/konto.ts`

### `updateKundenBox(produkte: BoxProdukt[])`

```
1. Auth: supabase.auth.getUser() → userId (kein User → Unauthorized-Error)
2. KundenProfile.id holen via user_id
3. BoxKonfiguration updaten — WHERE: { kunde_id: profile.id } (niemals eine client-seitige ID verwenden):
   - produkte: produkte as object  (JSONB-Snapshot)
   - gesamtpreis: Summe der Produktpreise (Σ produkt.preis × produkt.menge)
   - geaendert_am: auto via @updatedAt
4. Gibt { error?: string } zurück
```

**Ownership-Invariante:** `BoxKonfiguration.kunde_id @unique` im Phase-1-Schema garantiert genau eine Box pro Kunde. Das WHERE `{ kunde_id: profile.id }` ist die einzige korrekte Lookup-Strategie — kein Client-seitiger BoxId-Parameter.

### `createAnfrage(kategorie: AnfrageKategorie, nachricht: string)`

```
1. Auth: supabase.auth.getUser() → userId
2. Validation: nachricht.trim().length >= 5
3. KundenProfile.id holen via user_id
4. Betreff auto-generieren:
   box       → "Anfrage: Box-Inhalt"
   lieferung → "Anfrage: Lieferung"
   adresse   → "Anfrage: Adresse"
   sonstiges → "Anfrage: Sonstiges"
5. Anfrage.create({ kunde_id, kategorie, betreff, nachricht, status: 'offen' })
6. Gibt { error?: string } zurück
```

**`AnfrageKategorie` Enum** (aus Phase 1 Schema): `box | lieferung | adresse | sonstiges`
(Kategorie `loeschung` ist intern reserviert, erscheint nicht im Kunden-Formular.)

**Fehlerbehandlung:** Bei fehlgeschlagenen Writes gibt die Server Action `{ error: '...' }` zurück. Kein Redirect on error — das UI zeigt die Fehlermeldung inline.

---

## Seiten-Änderungen

### `/konto` — Dashboard

**Wird:** Server Component (bereits, kein 'use client')
**Änderung:** Ersetzt `MOCK_KUNDEN[0]` durch `getKontoDashboard(userId)`.

Zeigt:
- `profile.vorname` (Begrüßung)
- `profile.pflegegrad` + `profile.krankenkasse`
- Aktuelle Box: Produktnamen aus `profile.box_konfiguration.produkte` (JSONB)
- Nächste Lieferung: `profile.lieferungen[0].geplant_fuer` (DE-Datum) + Status-Badge
- Offene Anfragen: `profile.anfragen.length` (bereits gefiltert auf `status: 'offen'`)

### `/konto/meine-box` — Meine Box

**Wird:** Server Component (Datenladen) + neuer `<BoxEditor>` Client Component

```
page.tsx (Server Component)
  → getKundenBox(userId)
  → <BoxEditor initialBox={...} /> (Client Component)

BoxEditor (Client Component)
  → Konfigurator (existierender Component, bleibt unverändert)
  → onSave: ruft updateKundenBox() Server Action auf (useTransition)
  → Zeigt ✓ gespeichert / Fehlermeldung
```

**Produktkatalog:** `MOCK_PRODUKTE` bleibt die Quelle der verfügbaren Produkte — echte DB-Produkte kommen in Phase 4.

**`initialBox`:** `BoxKonfiguration.produkte` (JSONB) wird als `BoxProdukt[]` gecastet. Die im Snapshot gespeicherten Mock-Produkt-IDs (p1, p2 …) entsprechen `MOCK_PRODUKTE` — Kompatibilität sichergestellt.

### `/konto/lieferungen` — Lieferungen

**Wird:** Server Component (bereits, kein 'use client')
**Änderung:** Ersetzt `MOCK_LIEFERUNGEN` durch `getKundenLieferungen(userId)`.

| Mock-Feld | DB-Feld |
|---|---|
| `l.datum` | `l.geplant_fuer` (Date → `Intl.DateTimeFormat('de-DE')`) |
| `l.status` | `l.status` (`LieferungStatus` Enum) |
| `l.boxSnapshot.length` | `(l.box_snapshot as BoxProdukt[]).length` |
| `l.gesamtwert` | — wird aus box_snapshot berechnet |

**Status-Labels:** `geplant → Geplant`, `in_bearbeitung → In Bearbeitung`, `versendet → Versendet`, `zugestellt → Zugestellt`, `storniert → Storniert`

### `/konto/anfragen` — Anfragen

**Wird:** Server Component (Datenladen) + neuer `<AnfrageFormular>` Client Component

```
page.tsx (Server Component)
  → getKundenAnfragen(userId)
  → <AnfrageFormular />   (Client Component — kein Prop nötig, Action holt Auth selbst)
  → Anfragen-Liste (Server-gerendert)
```

**AnfrageFormular** (Client Component):
- Kategorie-Selector: box, lieferung, adresse, sonstiges (Labels auf Deutsch)
- Textarea (min. 5 Zeichen)
- Submit via `createAnfrage()` Server Action (useTransition)
- Nach Erfolg: Textarea leeren + `router.refresh()` um Liste neu zu laden

### `/konto/einstellungen` — Einstellungen

**Wird:** Server Component (Datenladen) + neuer `<EinstellungenClient>` Client Component

```
page.tsx (Server Component)
  → getKundenEinstellungen(userId)
  → <EinstellungenClient profil={...} /> (Client Component)
```

**EinstellungenClient** (Client Component):
- Zeigt echte Kontaktdaten (vorname, nachname, email aus Profile*, adresse, krankenkasse)
- "Passwort ändern" und "Account löschen" bleiben als Demo-Buttons
- Löschen-Dialog bleibt als reine UI-Interaktion (useState — kein DB-Write)

*`email` kommt aus `supabase.auth.getUser()`, nicht aus KundenProfile. Page übergibt sie als separate Prop.

---

## Neue Dateien

```
src/
  lib/
    dal/
      konto.ts                    NEW — alle 5 Lese-Funktionen
  app/
    actions/
      konto.ts                    NEW — updateKundenBox() + createAnfrage()
    konto/
      meine-box/
        box-editor.tsx            NEW — Client Component Wrapper um Konfigurator
      anfragen/
        anfrage-formular.tsx      NEW — Client Component für neue Anfrage
      einstellungen/
        einstellungen-client.tsx  NEW — Client Component (Löschen-Dialog UI)
```

## Geänderte Dateien

```
src/app/konto/page.tsx            MODIFY — echte Daten via getKontoDashboard()
src/app/konto/meine-box/page.tsx  MODIFY → Server Component, rendert BoxEditor
src/app/konto/lieferungen/page.tsx MODIFY — echte Daten via getKundenLieferungen()
src/app/konto/anfragen/page.tsx   MODIFY → Server Component, rendert AnfrageFormular
src/app/konto/einstellungen/page.tsx MODIFY → Server Component, rendert EinstellungenClient
```

---

## Keine Prisma-Migration nötig

Phase 3 verwendet ausschließlich das bestehende Phase-1-Schema. Es werden keine neuen Felder oder Tabellen angelegt.

---

## Lieferergebnis Phase 3

Nach Abschluss ist folgendes funktionsfähig:

- [ ] Dashboard zeigt echten Kundennamen, echte Box, nächste Lieferung aus DB
- [ ] "Meine Box" lädt aktuelle BoxKonfiguration aus DB, speichert Änderungen in DB
- [ ] Lieferungen-Seite zeigt echte Lieferhistorie aus DB
- [ ] Anfragen: echte Anfragen werden geladen, neue Anfragen landen in DB
- [ ] Einstellungen zeigt echte Kontaktdaten (read-only)
- [ ] Kein `MOCK_KUNDEN`, `MOCK_LIEFERUNGEN`, `MOCK_ANFRAGEN` mehr in `/konto/*`
- [ ] `MOCK_PRODUKTE` bleibt nur noch im Funnel und Konfigurator (Produktkatalog)
- [ ] Alle anderen Seiten unverändert
