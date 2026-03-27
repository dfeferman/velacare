# Velacare Phase 2 — Echter Funnel (v2 UI + Backend)

> **Entstehung:** Skill: superpowers:brainstorming
> **Datum:** 27. März 2026
> **Status:** Approved

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
| `versicherungsnummer` | string | Step 2 |
| `adresszusatz` | string (optional) | Step 2 |
| `versorgungssituation` | `'erstversorgung' \| 'wechsel'` | Step 2 |
| `beratung` | boolean | Step 2 |
| `lieferadresse_abweichend` | boolean | Step 2 |
| `lieferadresse` | `{ strasse, hausnummer, plz, ort }` (optional) | Step 2 |

---

## Architektur

```
/beantragen (page.tsx — 'use client')
  ├── Step1Produktauswahl   → onWeiter(produkte: BoxProdukt[])
  ├── Step2Daten            → onWeiter(data: Step2Data)
  ├── Step3Bestaetigung     → ruft registerKunde(step1, step2) auf
  └── redirect → /beantragen/danke
```

### State Management (`page.tsx`)

`page.tsx` bleibt ein Client Component und hält den gesamten Funnel-State:

```typescript
type Step2Data = {
  vorname: string
  nachname: string
  geburtsdatum: string
  pflegegrad: 1 | 2 | 3 | 4 | 5
  krankenkasse: string
  versicherungsnummer: string
  strasse: string
  hausnummer: string
  adresszusatz?: string
  plz: string
  ort: string
  lieferadresse_abweichend: boolean
  lieferadresse?: { strasse: string; hausnummer: string; plz: string; ort: string }
  telefon: string
  email: string
  passwort: string
  versorgungssituation: 'erstversorgung' | 'wechsel'
  beratung: boolean
}

// State in page.tsx
const [schritt, setSchritt] = useState<1 | 2 | 3 | 4>(1)
const [step1, setStep1] = useState<{ produkte: BoxProdukt[] } | null>(null)
const [step2, setStep2] = useState<Step2Data | null>(null)
```

- Step1 `onWeiter(produkte)` → setzt `step1`, geht zu Schritt 2
- Step2 `onWeiter(data)` → setzt `step2`, geht zu Schritt 3
- Step3 erhält `step1` + `step2` als Props, ruft Server Action auf

---

## Server Action: `registerKunde()`

Datei: `src/app/actions/register.ts`

Wird von Step3 bei Klick auf "Jetzt kostenfrei beantragen" aufgerufen.

### Ablauf

```typescript
'use server'

// liefertag wird in Step 3 (Bestätigung) ausgewählt, nicht in Step 1
export async function registerKunde(
  produkte: BoxProdukt[],
  liefertag: number,
  step2: Step2Data
): Promise<{ error?: string }> {

  // 1. Supabase signUp
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: step2.email,
    password: step2.passwort,
  })
  if (error) return { error: error.message }
  const userId = data.user!.id

  // 2. app_metadata.rolle = 'kunde' via Admin API (Service Role Key)
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { rolle: 'kunde' },
  })

  // 3. KundenProfile upsert (idempotent gegen DB-Trigger-Race)
  await prisma.kundenProfile.upsert({
    where: { profileId: userId },
    create: {
      profileId: userId,
      vorname: step2.vorname,
      nachname: step2.nachname,
      geburtsdatum: new Date(step2.geburtsdatum),
      pflegegrad: step2.pflegegrad,
      krankenkasse: step2.krankenkasse,
      versicherungsnummer: step2.versicherungsnummer,
      strasse: step2.strasse,
      hausnummer: step2.hausnummer,
      adresszusatz: step2.adresszusatz,
      plz: step2.plz,
      ort: step2.ort,
      versorgungssituation: step2.versorgungssituation,
      beratung: step2.beratung,
    },
    update: { /* same fields */ },
  })

  // 4. BoxKonfiguration erstellen
  await prisma.boxKonfiguration.create({
    data: {
      kundeId: userId,
      liefertag,
      produkte, // JSONB snapshot
      status: 'aktiv',
    },
  })

  // 5. Einwilligungen speichern
  await prisma.einwilligung.createMany({
    data: [
      { profileId: userId, typ: 'agb', version: '1.0', zugestimmtAm: new Date() },
      { profileId: userId, typ: 'dsgvo', version: '1.0', zugestimmtAm: new Date() },
    ],
  })

  redirect('/beantragen/danke')
}
```

### Fehlerbehandlung

- E-Mail bereits vergeben → Supabase gibt Fehler zurück → `{ error: 'Email already registered' }` → Step3 zeigt Fehlermeldung, kein Redirect, kein DB-Write
- Netzwerkfehler → gleicher Weg → Fehlermeldung in Step3

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

**Neue Felder in `KundenProfile`:**
```prisma
versicherungsnummer  String?     @db.VarChar(20)
hausnummer           String      @db.VarChar(10)
adresszusatz         String?     @db.VarChar(100)
versorgungssituation String      @default("erstversorgung") @db.VarChar(20)
beratung             Boolean     @default(false)
lieferadresse_json   Json?       // abweichende Lieferadresse als JSONB
```

---

## Neue Utility-Datei

`src/lib/supabase/admin.ts` — neu in Phase 2 (nicht in Phase 1 enthalten):

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

Wird nur in Server Actions verwendet. `SUPABASE_SERVICE_ROLE_KEY` darf nie im Browser landen.

---

## Für später notiert

- **Phase 5:** Passwortloser Login via Magic Link / "Passwort per E-Mail setzen" als Ablösung des Passwort-Felds im Funnel
- **Phase 5:** Resend + eigene E-Mail-Templates mit Velacare-Branding
- **Spätere Phase:** Digitale Unterschrift (Canvas-Pad) in Step 3

---

## Lieferergebnis Phase 2

Nach Abschluss ist folgendes funktionsfähig und testbar:

- [ ] v2 Funnel-UI unter `/beantragen` (alle 4 Schritte)
- [ ] Step1: Produktauswahl mit Budget-Tracker
- [ ] Step2: Alle neuen Felder vorhanden, Validierung funktioniert
- [ ] Step3: Zeigt echte Nutzerdaten, Konto-Hinweis, AGB/DSGVO
- [ ] Step3: `registerKunde()` Server Action erstellt echten Account
- [ ] Step3: Fehlerbehandlung bei bereits vorhandener E-Mail
- [ ] Danke-Seite mit E-Mail-Bestätigungs-Hinweis
- [ ] Neue Prisma-Migration für zusätzliche KundenProfile-Felder
- [ ] Alle anderen Seiten weiterhin funktionsfähig (Mock unverändert)
