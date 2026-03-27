# Velacare Phase 2 — Echter Funnel (v2 UI + Backend)

> **Entstehung:** Skill: superpowers:brainstorming
> **Datum:** 27. März 2026
> **Status:** Approved (überarbeitet nach Architektur-Review 2026-03-28)

---

## Ziel

Den bestehenden `/beantragen`-Funnel durch die v2-UI ersetzen und gleichzeitig mit echter Supabase Auth + Prisma-Datenbank verbinden. Nach Abschluss ist der Registrierungsprozess vollständig funktionsfähig: Nutzer legen echte Accounts an, alle Antragsdaten landen in der DB. Mock-Daten bleiben für Kundenportal und Admin erhalten.

**Abhängigkeit:** Phase 1 (Supabase-Verbindung, Prisma-Schema, Middleware) muss abgeschlossen sein.

---

## Scope

**In Phase 2:**
- v2 Funnel-UI für `/beantragen` (neue Schritt-Reihenfolge, neue Felder, v2 Design)
- Echter Signup via `supabase.auth.signUp()`
- DB-Writes: KundenProfile + BoxKonfiguration + Einwilligungen
- E-Mail-Bestätigung (Standard Supabase Template)
- Passwort-Feld in Step 2 (klassische Account-Erstellung)

**Nicht in Phase 2:**
- v2 Design für Landing, Nav, Konto, Admin (bleibt v1)
- Digitale Unterschrift (Canvas-Pad) → spätere Phase
- Resend / eigene E-Mail-Templates → Phase 5
- Passwortloser Login (Magic Link) → Phase 5
- Kundenportal mit echten Daten → Phase 3
- Admin mit echten Daten → Phase 4

---

## v2 Funnel-Struktur

### Neue Schritt-Reihenfolge

| Schritt | Bezeichnung | Inhalt |
|---|---|---|
| 1 | Produktauswahl | Box zusammenstellen (Budget-Tracker), ohne Preisanzeige |
| 2 | Ihre Daten | Persönliche Daten, Pflegegrad, Krankenkasse, Account-Daten |
| 3 | Bestätigung | Zusammenfassung, Konto-Hinweis, AGB/DSGVO, Absenden |
| 4 | Abschluss | Danke-Seite (`/beantragen/danke`) — statische Route |

**Wegfällt:** Separater Anspruch-Check (Step 1 v1) als eigener Step — Pflegegrad wird direkt in Step 2 abgefragt.

### Neue Felder gegenüber v1

| Feld | Typ | Wo |
|---|---|---|
| `pflegegrad` | `1 \| 2 \| 3 \| 4 \| 5` | Step 2 |
| `versicherungsnummer` | string | Step 2 |
| `hausnummer` | string | Step 2 (war bisher mit Straße zusammen) |
| `adresszusatz` | string (optional) | Step 2 |
| `versorgungssituation` | `'erstversorgung' \| 'wechsel'` (Prisma Enum) | Step 2 |
| `beratung` | boolean | Step 2 |
| `lieferadresse_abweichend` | boolean | Step 2 |
| `lieferadresse` | `{ strasse, hausnummer, plz, ort }` (optional) | Step 2 |

---

## Architektur

```
/beantragen (page.tsx — 'use client')
  ├── Step1Produktauswahl   → onWeiter(produkte: BoxProdukt[])
  ├── Step2Daten            → onWeiter(data: Step2Data)
  ├── Step3Bestaetigung     → hält liefertag lokal, ruft registerKunde(produkte, liefertag, step2) auf
  └── redirect → /beantragen/danke
```

### Gemeinsames Validierungsschema

**Datei:** `src/lib/schemas/register.ts`

Wird sowohl von Step2 (Client-Validierung) als auch von `registerKunde()` (Server-Validierung) importiert. Single Source of Truth für alle Felder und Regeln.

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  // Persönliche Daten
  vorname:             z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname:            z.string().min(2, 'Mindestens 2 Zeichen'),
  geburtsdatum:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum (YYYY-MM-DD)'),
  pflegegrad:          z.number().int().min(1).max(5),
  krankenkasse:        z.string().min(2, 'Pflichtfeld'),
  versicherungsnummer: z.string().min(6, 'Ungültige Versicherungsnummer'),
  // Adresse
  strasse:             z.string().min(2, 'Pflichtfeld'),
  hausnummer:          z.string().min(1, 'Pflichtfeld'),
  adresszusatz:        z.string().optional(),
  plz:                 z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
  ort:                 z.string().min(2, 'Pflichtfeld'),
  // Kontakt
  telefon:             z.string().min(6, 'Pflichtfeld'),
  // Versorgung
  versorgungssituation: z.enum(['erstversorgung', 'wechsel']),
  beratung:            z.boolean(),
  // Lieferadresse
  lieferadresse_abweichend: z.boolean(),
  lieferadresse: z.object({
    strasse:    z.string().min(2),
    hausnummer: z.string().min(1),
    plz:        z.string().regex(/^\d{5}$/),
    ort:        z.string().min(2),
  }).optional(),
  // Account
  email:   z.string().email('Gültige E-Mail-Adresse'),
  passwort: z.string().min(8, 'Mindestens 8 Zeichen'),
})

export type Step2Data = z.infer<typeof registerSchema>
```

### State Management (`page.tsx`)

`page.tsx` bleibt ein Client Component und hält den gesamten Funnel-State. `Step2Data` wird aus `registerSchema` inferiert (kein doppelter Typ).

```typescript
// State in page.tsx
const [schritt, setSchritt] = useState<1 | 2 | 3>(1)
const [step1, setStep1] = useState<{ produkte: BoxProdukt[] } | null>(null)
const [step2, setStep2] = useState<Step2Data | null>(null)
```

- Step1 `onWeiter(produkte)` → setzt `step1`, geht zu Schritt 2
- Step2 `onWeiter(data)` → setzt `step2`, geht zu Schritt 3
- Step3 hält `liefertag` lokal (`useState<number>(1)`), ruft Server Action auf
- Die Danke-Seite ist eine eigene statische Route `/beantragen/danke` (kein Schritt 4 im State)

### Datenschutz-Regeln (Client-State)

Das Passwort liegt kurzzeitig im Client-State von `page.tsx`. Explizite Regeln:
- `passwort` darf **niemals geloggt** werden (kein `console.log(step2)`)
- `versicherungsnummer` darf **niemals geloggt** werden
- `pflegegrad` und `geburtsdatum` dürfen **niemals in Fehlermeldungen oder Analytics** erscheinen
- Fehlermeldungen dürfen **keine Feldwerte** enthalten, nur Feldnamen

---

## Server Action: `registerKunde()`

Datei: `src/app/actions/register.ts`

Wird von Step3 bei Klick auf "Jetzt kostenfrei beantragen" aufgerufen. `liefertag` wird in Step3 lokal gehalten (1–28, Standardwert 1) und beim Submit übergeben.

### Ablauf

```typescript
'use server'

import { registerSchema, type Step2Data } from '@/lib/schemas/register'

export async function registerKunde(
  produkte: BoxProdukt[],
  liefertag: number,
  step2: Step2Data
): Promise<{ error?: string }> {

  // 0. Serverseitige Validierung — kein Trust auf Client-Daten
  const result = registerSchema.safeParse(step2)
  if (!result.success) return { error: 'Ungültige Eingabedaten' }
  const d = result.data

  // 1. Supabase signUp
  const supabase = createClient()
  const { data: authData, error } = await supabase.auth.signUp({
    email: d.email,
    password: d.passwort,
  })
  if (error) return { error: error.message }
  const userId = authData.user!.id

  // 2. app_metadata.rolle = 'kunde' via Admin API (Service Role Key — nur server-side)
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { rolle: 'kunde' },
  })

  // 3–5. Prisma-Transaktion: alle DB-Writes atomar
  await prisma.$transaction([
    // 3. KundenProfile upsert (idempotent gegen DB-Trigger-Race + Retry)
    prisma.kundenProfile.upsert({
      where: { profileId: userId },
      create: {
        profileId: userId,
        vorname:             d.vorname,
        nachname:            d.nachname,
        geburtsdatum:        new Date(d.geburtsdatum),
        pflegegrad:          d.pflegegrad,
        krankenkasse:        d.krankenkasse,
        versicherungsnummer: d.versicherungsnummer,
        strasse:             d.strasse,
        hausnummer:          d.hausnummer,
        adresszusatz:        d.adresszusatz,
        plz:                 d.plz,
        ort:                 d.ort,
        versorgungssituation: d.versorgungssituation,
        beratung:            d.beratung,
        lieferadresse_json:  d.lieferadresse_abweichend ? d.lieferadresse : null,
      },
      update: {
        vorname:             d.vorname,
        nachname:            d.nachname,
        geburtsdatum:        new Date(d.geburtsdatum),
        pflegegrad:          d.pflegegrad,
        krankenkasse:        d.krankenkasse,
        versicherungsnummer: d.versicherungsnummer,
        strasse:             d.strasse,
        hausnummer:          d.hausnummer,
        adresszusatz:        d.adresszusatz,
        plz:                 d.plz,
        ort:                 d.ort,
        versorgungssituation: d.versorgungssituation,
        beratung:            d.beratung,
        lieferadresse_json:  d.lieferadresse_abweichend ? d.lieferadresse : null,
      },
    }),

    // 4. BoxKonfiguration — initialer Snapshot
    prisma.boxKonfiguration.create({
      data: {
        kundeId:  userId,
        liefertag,
        produkte, // JSONB snapshot, führendes Modell für Phase 2
        status:   'aktiv',
      },
    }),

    // 5. Einwilligungen — skipDuplicates sichert Idempotenz bei Retry
    prisma.einwilligung.createMany({
      data: [
        { profileId: userId, typ: 'agb',   version: '1.0', zugestimmtAm: new Date() },
        { profileId: userId, typ: 'dsgvo',  version: '1.0', zugestimmtAm: new Date() },
      ],
      skipDuplicates: true, // Unique Constraint: profileId + typ + version
    }),
  ])

  redirect('/beantragen/danke')
}
```

### Fehlerbehandlung

| Fehlerfall | Verhalten |
|---|---|
| E-Mail bereits vergeben | Supabase-Fehler → `{ error: 'Diese E-Mail-Adresse ist bereits registriert.' }` → Step3 zeigt Fehlermeldung, kein Redirect, kein DB-Write |
| Ungültige Eingaben (Schema) | `{ error: 'Ungültige Eingabedaten' }` → ohne Felddetails (kein Leak sensibler Werte) |
| Prisma-Transaktion fehlgeschlagen | `{ error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }` |
| Netzwerkfehler | Gleicher Weg → Fehlermeldung in Step3 |

**Doppelklick-Schutz:** Button wird beim ersten Klick deaktiviert (Loading State). `skipDuplicates: true` bei Einwilligungen schützt zusätzlich serverseitig.

**Bekannte Einschränkung Phase 2:** Wenn Schritt 2 (Admin API: Rolle setzen) erfolgreich war, aber die Prisma-Transaktion fehlschlägt, existiert ein Auth-Account ohne Kundenprofil. In Phase 2 wird dieser Fall manuell behandelt (Support-Eskalation). Vollständige Compensation-Logik → Phase 6.

---

## Step 3 — Bestätigung

### Inhalt

- **Zusammenfassung Produkte** — echte Daten aus Step1
- **Angaben zum Versicherten** — echte Daten aus Step2 (kein Hardcode mehr)
- **Konto-Hinweis** (Info-Box neu):
  > "Mit Ihrem Velacare-Konto können Sie Ihre Box jederzeit anpassen, Lieferungen pausieren und den Status Ihrer Bestellungen verfolgen. Eine Konto-Löschung ist jederzeit möglich."
- **AGB + DSGVO Checkboxen** — beide müssen angehakt sein
- **CTA:** "Jetzt kostenfrei beantragen" (disabled bis beide Checkboxen angehakt)
- **Fehlermeldung** wenn E-Mail bereits vergeben

### Loading State

Während Server Action läuft: Button zeigt Spinner + "Wird verarbeitet...", Form deaktiviert.

---

## Danke-Seite (`/beantragen/danke`)

Statische Route, kein State nötig. Zeigt:

- Erfolgs-Icon + "Vielen Dank für Ihr Vertrauen"
- **Hinweis auf E-Mail-Bestätigung:** "Wir haben Ihnen eine Bestätigungs-E-Mail geschickt. Bitte klicken Sie den Link, um Ihr Konto zu aktivieren."
- "Was passiert als nächstes?" (3 Schritte: Prüfung → Bestätigung → Versand)
- "Zur Startseite"-Button (kein "Zum Konto" — E-Mail noch nicht bestätigt)

---

## v2 Design (Funnel only)

Das v2 Design-System wird **ausschließlich für `/beantragen`** eingeführt. Alle anderen Seiten (Landing, Nav, Footer, Konto, Admin) behalten das aktuelle Design.

### Design-Entscheidungen für Funnel

- **Farben:** v2 Teal/Blau-Palette (aus `wireframes/v2/design.md`)
- **Fonts:** Newsreader (Headlines) + Manrope (Body) — nur im Funnel
- **No-Line Regel:** Keine 1px-Borders zur Sektionierung, nur Farbflächen-Wechsel
- **Tonal Layering:** Tiefe durch Hintergrundfarben, nicht durch Schatten
- **Input-Stil:** Rahmenlos, nur untere Linie bei Fokus

---

## Prisma Schema — Ergänzungen

Phase 1 hat `KundenProfile` ohne `versicherungsnummer`, `hausnummer`, `adresszusatz`, `versorgungssituation`, `beratung`. Phase 2 ergänzt diese Felder via Prisma Migration.

### Neuer Enum

```prisma
enum VersorgungsSituation {
  erstversorgung
  wechsel
}
```

### Neue Felder in `KundenProfile`

```prisma
versicherungsnummer  String?              @db.VarChar(20)
hausnummer           String               @db.VarChar(10)
adresszusatz         String?              @db.VarChar(100)
versorgungssituation VersorgungsSituation @default(erstversorgung)
beratung             Boolean              @default(false)
lieferadresse_json   Json?                // abweichende Lieferadresse als JSONB
```

### Unique Constraint auf `Einwilligung`

```prisma
model Einwilligung {
  // ... bestehende Felder ...
  @@unique([profileId, typ, version])
}
```

Verhindert doppelte Einwilligungen bei Retry / Doppelklick.

---

## Neue Dateien

### `src/lib/schemas/register.ts`

Gemeinsames Zod-Schema (siehe Abschnitt Architektur). Wird von Client (Step2) und Server (`registerKunde()`) importiert.

### `src/lib/supabase/admin.ts`

Neu in Phase 2 (nicht in Phase 1 enthalten):

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

**Governance-Regeln für `createAdminClient()`:**
- Darf **ausschließlich in Server Actions und Route Handlers** importiert werden
- Darf **niemals in Client Components** importiert werden
- `SUPABASE_SERVICE_ROLE_KEY` muss in Vercel als Server-only Env-Variable konfiguriert sein (kein `NEXT_PUBLIC_`-Präfix)
- Jeder Aufruf von `admin.auth.admin.*` muss im AuditLog landen (Phase 6)

---

## Für später notiert

- **Phase 5:** Passwortloser Login via Magic Link / "Passwort per E-Mail setzen" als Ablösung des Passwort-Felds im Funnel
- **Phase 5:** Resend + eigene E-Mail-Templates mit Velacare-Branding
- **Spätere Phase:** Digitale Unterschrift (Canvas-Pad) in Step 3

---

## Lieferergebnis Phase 2

Nach Abschluss ist folgendes funktionsfähig und testbar:

- [ ] `src/lib/schemas/register.ts` — gemeinsames Zod-Schema für Client + Server
- [ ] v2 Funnel-UI unter `/beantragen` (alle 3 Schritte + Danke-Seite)
- [ ] Step1: Produktauswahl mit Budget-Tracker
- [ ] Step2: Alle neuen Felder vorhanden, Client-Validierung via `registerSchema`
- [ ] Step3: Zeigt echte Nutzerdaten, `liefertag`-Auswahl, Konto-Hinweis, AGB/DSGVO
- [ ] Step3: `registerKunde()` Server Action mit serverseitiger Validierung
- [ ] Step3: Prisma-Transaktion für atomare DB-Writes
- [ ] Step3: Fehlerbehandlung (E-Mail vergeben, Validierungsfehler, Transaktionsfehler)
- [ ] Step3: Doppelklick-Schutz (Button deaktiviert während Verarbeitung)
- [ ] Danke-Seite mit E-Mail-Bestätigungs-Hinweis
- [ ] Neue Prisma-Migration: neue KundenProfile-Felder + `VersorgungsSituation`-Enum + Unique Constraint auf Einwilligung
- [ ] `src/lib/supabase/admin.ts` — Service Role Client (server-only)
- [ ] Alle anderen Seiten weiterhin funktionsfähig (Mock unverändert)
