# Velacare V1 — Implementierungs-Design

> **Entstehung:** Skill: superpowers:brainstorming

## Übersicht

Velacare ist ein Pflegehilfsmittel-Service (§ 40 SGB XI): monatliche Lieferboxen für Menschen mit Pflegegrad 1–5, kostenlos über die Pflegekasse (bis 42 €/Monat). Ziel von V1 ist eine vollständige Web-App mit öffentlicher Website, Kundenportal und Admin-Panel — ohne automatisierte Kassenkommunikation.

## Gewählter Ansatz: Outside-In mit Mocks (Phase 1) → Backend (Phase 2)

**Begründung:** Der Entwickler arbeitet alleine und benötigt zunächst visuelles Material (für Stakeholder-Feedback, eigene Validierung). Daher wird die App zuerst als voll klickbarer Prototyp mit Mock-Daten gebaut. Sobald die UI steht, wird das Backend schrittweise eingewechselt.

## Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS-Variablen (Velacare Design-System) |
| Mock-Daten | `src/lib/mock-data.ts` (TypeScript-Objekte) |
| DB (Phase 2) | PostgreSQL via Supabase |
| ORM (Phase 2) | Prisma |
| Auth (Phase 2) | NextAuth.js (E-Mail/Passwort) |
| E-Mail (Phase 2) | Resend |
| Hosting | Vercel + Supabase (EU-Region Frankfurt) |
| Monitoring | Sentry (Phase 2) |

## Design-System

Aus dem Velacare Brand Guide übernommen:

- **Fonts:** Cormorant Garamond (Serif, Headlines) + DM Sans (Sans, Body) + DM Mono
- **Farben:** Terra `#C96B3F` (Primär), Sage `#2D7A5F` (Akzent), Warm White `#FDFAF7`, Background `#F5F0EB`
- **Radius:** sm 6px / md 10px / lg 16px / xl 24px
- Farb-Tokens als Tailwind-Variablen (CSS custom properties)

## Rollen (V1)

- **Kunde** — öffentlich registrierbar, verwaltet eigene Box + Lieferungen
- **Admin** — nur intern angelegt, verwaltet Kunden/Produkte/Bestellungen
- **Superadmin** — legt Admins an, Systemeinstellungen (in V1 per Seed-Script)

## Phase 1 — Visueller Prototyp (Mock-Daten)

Alle Seiten werden mit statischen TypeScript-Mock-Daten gebaut. Kein echter Submit, kein Login — UI-only, vollständig klickbar.

### Reihenfolge der Implementierung

**1. Projekt-Setup**
- Next.js 14 + TypeScript + Tailwind
- Design-System: CSS-Variablen, Font-Einbindung, Basis-Komponenten (Button, Card, Badge, Input)
- `src/lib/mock-data.ts` mit Mock-Produkten, Mock-Kunden, Mock-Lieferungen
- `src/lib/mock-store.ts` — einfacher In-Memory-State (React useState/Context) für simulierte CRUD-Operationen im Admin-Panel (create/edit/delete wirken sich auf den lokalen State aus, kein echter Persist)
- Platzhalter-Route `/login` (leere Seite mit „Coming soon") für spätere NextAuth-Integration
- Basis-Layout (Nav, Footer)

**2. `/` — Landing Page**
- Hero mit CTA „Jetzt beantragen"
- „Wie es funktioniert" (3 Schritte)
- Produkte-Teaser
- Vertrauenselemente (Pflegekasse, kostenlos, monatlich)

**3. `/beantragen` — 4-Schritt-Funnel**
- Schritt 1: Anspruch prüfen (Pflegegrad, Pflegeort, Versicherungsart)
- Schritt 2: Persönliche Daten (Pflegebedürftiger + optionaler Angehöriger)
- Schritt 3: Box-Konfigurator (Mock-Produkte, Live-Budget-Counter 0–42 €)
- Schritt 4: Bestätigung + DSGVO-Einwilligung + Wunsch-Lieferstichtag
- Fortschrittsbalken, Validierung (Zod, client-side), „Danke"-Seite am Ende

**4. `/konto` — Kundenportal**
- Dashboard: aktuelle Box, nächste Lieferung, Benachrichtigungen (Mock)
- `/konto/meine-box`: Box-Konfigurator (bearbeitbar, Mock-Save)
- `/konto/lieferungen`: Lieferverlauf (Mock-Daten)
- `/konto/einstellungen`: Kontaktdaten, Passwort, Account löschen
- `/konto/anfragen`: Anfragen stellen + Antworten (Mock)
- Kein echter Login — direkt auf `/konto` navigierbar

**5. `/admin` — Admin-Panel**
- Dashboard: KPIs (Mock-Zahlen), neue Anfragen
- `/admin/kunden`: Liste + Detailansicht (Mock-Kundendaten)
- `/admin/produkte`: CRUD-UI mit Mock-Produkten
- `/admin/lieferungen`: Übersicht mit Status-Badges
- `/admin/anfragen`: Support-Tickets (Mock)
- Kein echter Auth-Guard in Phase 1

**6. Marketing-Unterseiten**
- `/wie-es-funktioniert`
- `/produkte` (öffentliche Produktübersicht)
- `/faq`
- `/ueber-uns`
- `/kontakt`

## Phase 2 — Backend-Anbindung

Schrittweise Ersetzung der Mock-Daten:

1. **Supabase + Prisma** — DB-Schema anlegen, Migrations
2. **NextAuth** — Login/Session für Kunden + Admins, Auth-Guards
3. **API Routes** — CRUD für Produkte, Kunden, Bestellungen, Anfragen
4. **E-Mail (Resend)** — Bestätigung, Willkommen, Admin-Benachrichtigungen
5. **Seed-Script** — Superadmin-Account, initiale Produktliste

## Datenmodell (Referenz aus Softwarekonzept)

Kernentitäten für Phase 2:
- `users` (id, email, role: kunde|admin|superadmin, pflegegrad, adresse, krankenkasse, ist_angehoerige: bool, ...)
  - Hinweis: Der Account-Inhaber kann der Pflegebedürftige selbst oder ein Angehöriger sein. Feld `ist_angehoerige` + optionale `pflegebeduerftige_*` Felder (Name, Geburtsdatum) für den Fall, dass jemand für eine andere Person beantragt.
- `produkte` (id, name, beschreibung, preis, kategorie, aktiv, bild_url)
- `box_konfigurationen` (id, user_id, produkte JSONB, gesamtwert, gueltig_ab)
- `antraege` (id, user_id, box_konfiguration_id, status: neu|in_bearbeitung|aktiv|abgelehnt, eingegangen_am)
  - Repräsentiert die initiale Einreichung aus dem Funnel. Erst nach Admin-Freigabe wird eine erste `lieferung` angelegt.
- `lieferungen` (id, user_id, box_snapshot JSONB, stichtag, status, ...)
- `anfragen` (id, user_id, kategorie, nachricht, status, antwort, ...)
- `audit_log` (INSERT-only, unveränderlich)

## Sicherheit & DSGVO (Phase 2)

- Alle API-Endpoints prüfen Ressourcen-Ownership
- Passwörter: bcrypt
- Sessions: JWT via NextAuth
- DSGVO-Löschung: innerhalb 30 Tage, per Admin bestätigt
- Audit-Log: INSERT-only, kein DELETE/UPDATE über API
- Input-Validierung: Zod serverseitig

## Offene Fragen (vor Phase 2 klären)

- Produktliste für V1 (Name, Beschreibung, Preis, Fotos)
- Lieferstichtag: freie Wahl 1–28 oder feste Stichtage?
- Krankenkassen: Freitext oder Dropdown?
- Admin-Benachrichtigungs-E-Mail-Adresse

## Erfolgskriterien V1

- Alle Seiten responsiv (Desktop + Mobile)
- Box-Konfigurator mit Live-Budget-Counter funktioniert
- Registrierungs-Funnel vollständig klickbar
- Kundenportal und Admin-Panel vollständig navigierbar
- Design entspricht Velacare Brand Guide
