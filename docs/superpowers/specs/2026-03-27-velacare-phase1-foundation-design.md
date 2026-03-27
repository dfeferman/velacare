# Velacare Phase 1 — Foundation Design

> **Entstehung:** Skill: superpowers:brainstorming
> **Datum:** 27. März 2026
> **Status:** Approved

---

## Ziel

Produktionsbereite Infrastruktur-Basis für Velacare: Supabase verbunden, vollständiges Prisma-Schema migriert, echte Authentifizierung via Supabase Auth, Route Guards für alle geschützten Bereiche. Mock-Daten bleiben für alle anderen Features erhalten — Phase 1 ersetzt nur den Auth-Layer und legt das DB-Fundament.

---

## Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) — bereits vorhanden |
| ORM | Prisma + `@prisma/client` |
| Auth | Supabase Auth via `@supabase/ssr` |
| Datenbank | PostgreSQL via Supabase (EU-Frankfurt) |
| Hosting | Vercel (unverändert) |

**Neue Dependencies:**
- `@supabase/supabase-js`
- `@supabase/ssr`
- `prisma`
- `@prisma/client`

---

## Infrastruktur

**Supabase:**
- Ein Projekt (Free Tier) für Development — wird später zu Production oder per Prisma-Migration auf ein neues Prod-Projekt übertragen
- Region: EU Frankfurt (DSGVO)
- Rolle wird in Supabase Auth `app_metadata.rolle` gespeichert → im JWT enthalten, kein DB-Abfrage in Middleware nötig

**Environment:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # nur server-side, nie im Client
DATABASE_URL=                    # Prisma: Transaction Pooler URL (port 6543)
DIRECT_URL=                      # Prisma: Direct Connection URL (port 5432, für Migrations)
```

---

## Architektur

```
Browser
    ↓
Next.js Middleware          ← prüft Session via @supabase/ssr
    ├── /konto/*  → Session + rolle=kunde erforderlich
    └── /admin/*  → Session + rolle=admin|superadmin erforderlich
    ↓
Server Components / API Routes
    ├── Prisma Client       ← alle Datenbankzugriffe (public.*)
    └── Supabase Client     ← nur Auth (Session lesen/schreiben)
    ↓
Supabase PostgreSQL (EU-Frankfurt)
    ├── auth.users          ← verwaltet von Supabase intern
    └── public.*            ← unser Schema via Prisma
```

**Trennung:** Prisma greift ausschließlich auf `public.*` zu. `auth.*` wird nie direkt per Prisma abgefragt — nur via Supabase Auth Client.

---

## Prisma Schema

Alle 10 Tabellen aus dem v2-Konzept werden vollständig angelegt. Einzige Abweichung vom Konzept: Die Konzept-Tabelle `users` wird als `profiles` implementiert, da Supabase Auth intern bereits eine `auth.users`-Tabelle verwaltet.

### Tabellen-Übersicht

| Prisma-Modell | Konzept-Tabelle | Beschreibung |
|---|---|---|
| `Profile` | `users` | id = auth.users.id (UUID), rolle, status, Timestamps |
| `KundenProfile` | `kunden_profile` | Healthcare-Daten, 1:1 zu Profile |
| `Produkt` | `produkte` | Produktkatalog mit Varianten (JSONB) |
| `BoxKonfiguration` | `box_konfigurationen` | Aktuelle Box je Kunde |
| `BoxKonfigurationVerlauf` | `box_konfigurationen_verlauf` | Änderungshistorie der Box |
| `Lieferung` | `lieferungen` | Monatlicher Lieferverlauf mit box_snapshot (JSONB) |
| `Anfrage` | `anfragen` | Kundenanfragen mit Admin-Antwort |
| `Einwilligung` | `einwilligungen` | DSGVO-Nachweis mit Versionierung |
| `Benachrichtigung` | `benachrichtigungen` | In-App Notifications |
| `AuditLog` | `audit_log` | INSERT-only Änderungsprotokoll |

### Enums

```prisma
enum Rolle          { kunde admin superadmin }
enum UserStatus     { aktiv gesperrt geloescht ausstehend }
enum ProduktKat     { handschuhe desinfektion mundschutz schutzkleidung hygiene sonstiges }
enum LieferStatus   { geplant in_bearbeitung versendet zugestellt storniert }
enum LieferungStatus { aktiv pausiert gesperrt }
enum AnfrageKat     { box lieferung adresse loeschung sonstiges }
enum AnfrageStatus  { offen in_bearbeitung beantwortet geschlossen }
enum EinwillTyp     { dsgvo agb marketing }
enum NotifTyp       { lieferung_status anfrage_beantwortet system }
```

### Wichtige Hinweise

- **Verschlüsselung:** Felder `vorname`, `nachname`, `geburtsdatum`, `pflegegrad` in `KundenProfile` werden in **Phase 6** (Sicherheit & DSGVO) auf Application-level Encryption umgestellt. In Phase 1 plain text.
- **AuditLog INSERT-only:** Das Schema wird in Phase 1 vollständig angelegt. Der separate DB-Nutzer mit reinen INSERT-Rechten kommt in **Phase 6**.
- **Keine Umlaute** in Feldnamen (PostgreSQL-Konvention aus dem Konzept).
- Alle IDs als UUID.

---

## Auth Flow

### Login

1. Nutzer öffnet `/login` — echtes Formular (E-Mail + Passwort)
2. Client ruft `supabase.auth.signInWithPassword()` auf
3. Supabase validiert Credentials, gibt JWT zurück
4. `@supabase/ssr` speichert Session in HTTP-only Cookie
5. Redirect basierend auf `app_metadata.rolle`:
   - `kunde` → `/konto`
   - `admin` / `superadmin` → `/admin`

### Logout

1. `supabase.auth.signOut()`
2. Cookie wird gelöscht
3. Redirect → `/`

### Session-Management

- `@supabase/ssr` verwaltet Token-Refresh automatisch
- Server Components lesen Session direkt via `createServerClient()`
- Kein Client-seitiger Fetch für Auth-State nötig

### Route Guards (middleware.ts)

```
/konto/*   → Session required + rolle === 'kunde'
             Kein Login → redirect /login
             Falsche Rolle → redirect /

/admin/*   → Session required + rolle === 'admin' || 'superadmin'
             Kein Login → redirect /login
             Falsche Rolle → redirect /

/login     → Bereits eingeloggt → redirect /konto (kunde) oder /admin (admin)
```

### Nutzer-Anlage (Registrierungs-Funnel)

1. Step 4 im Funnel: `supabase.auth.signUp({ email, password })`
2. Supabase sendet Bestätigungs-E-Mail (Standard Supabase Template für Phase 1)
3. Nach E-Mail-Bestätigung: **Supabase Database Trigger** legt automatisch `Profile` + leeres `KundenProfile` an
4. `app_metadata.rolle = 'kunde'` wird beim signUp gesetzt (via Service Role Key, server-side)

### Admin-Anlage

- Ausschließlich via **Seed-Script** (kein öffentlicher Signup)
- Script setzt `app_metadata.rolle = 'admin'` oder `'superadmin'`
- Läuft einmalig bei Projekt-Setup

---

## Lieferergebnis Phase 1

Nach Abschluss ist folgendes funktionsfähig und testbar:

- [ ] Supabase-Verbindung steht, Env-Variablen gesetzt
- [ ] Prisma-Schema vollständig, erste Migration durchgelaufen
- [ ] Login-Seite `/login` funktioniert (echte Auth, kein Mock)
- [ ] Logout funktioniert
- [ ] Middleware schützt `/konto/*` und `/admin/*`
- [ ] Rollenbasierter Redirect nach Login
- [ ] Seed-Script legt ersten Admin/Superadmin an
- [ ] Supabase Trigger legt Profile bei Signup an
- [ ] Alle anderen Seiten funktionieren weiterhin mit Mock-Daten

---

## Nicht in Phase 1

- Echte Daten im Funnel (bleibt Mock → Phase 2)
- Echte Daten im Kundenportal (bleibt Mock → Phase 3)
- Echte Daten im Admin-Panel (bleibt Mock → Phase 4)
- E-Mail-Templates (Resend → Phase 5)
- MFA für Admins → Phase 6
- Application-level Encryption → Phase 6
- pg_cron Jobs → Phase 5
