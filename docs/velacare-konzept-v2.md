# Velacare App – Softwarekonzept

**Datum:** März 2025  
**Version:** 2.1 (Hosting: Vercel)  
**Status:** In Review  
**Vertraulich:** Nur für internen Gebrauch

---

## Problem & Ziel

Pflegebedürftige mit Pflegegrad 2–5 haben Anspruch auf bis zu 42 €/Monat für Pflegehilfsmittel (§ 40 Abs. 2 SGB XI), schöpfen diesen Anspruch aber häufig nicht aus — weil der Antragsprozess unklar, aufwändig oder unbekannt ist. Velacare übernimmt diesen Prozess vollständig: Kunden stellen ihren Anspruch über ein geführtes Onboarding fest, stellen ihre monatliche Pflegehilfsmittel-Box individuell zusammen, und erhalten diese automatisch zugestellt. Version 1 läuft ohne direkte Kassenkommunikation — alle Anfragen werden manuell durch das Velacare-Team bearbeitet.

---

## Nicht-Ziele (Version 1)

- Keine automatisierte Pflegekassen-Kommunikation
- Keine digitale Unterschrift / eSignatur
- Keine automatische Rechnungsstellung
- Kein Partnerportal für Pflegedienste
- Keine Mobile App (iOS/Android)
- Kein Pflegegrad 1 — dieser hat keinen Anspruch auf die Pflegehilfsmittelpauschale

---

## Zielgruppe

| Rolle | Beschreibung |
|---|---|
| Kunde | Pflegebedürftige (Pflegegrad 2–5) oder deren Angehörige. Wenig technikaffin, ältere Zielgruppe — UI muss entsprechend einfach sein. |
| Admin | Velacare-Mitarbeiter. Verwalten Kunden, Produkte, Bestellungen und Anfragen. Werden manuell angelegt. |
| Superadmin | Betreiber. Vollzugriff inkl. System-Einstellungen, Admin-Verwaltung, Audit-Log. Einmalig per Seed-Script gesetzt. |

> **Wichtig:** Admin-Accounts können sich nicht öffentlich registrieren. Nur der Superadmin kann weitere Admins anlegen.

---

## Scope V1 vs. V2

| Feature | V1 | V2 |
|---|---|---|
| Registrierung & Login (E-Mail/Passwort) | ✓ | |
| Box individuell zusammenstellen (Konfigurator) | ✓ | |
| Kundenkonto — Daten einsehen & ändern | ✓ | |
| Lieferung pausieren / Stichtag ändern | ✓ | |
| Anfrage an Velacare stellen | ✓ | |
| Account löschen (DSGVO) | ✓ | |
| Admin: Kundenverwaltung (CRUD) | ✓ | |
| Admin: Produktverwaltung (CRUD) | ✓ | |
| Admin: Bestellübersicht & Status-Management | ✓ | |
| Admin: Anfragen bearbeiten | ✓ | |
| E-Mail-Benachrichtigungen (transaktional) | ✓ | |
| Automatische Pflegekassen-Kommunikation | | V2 |
| Digitale Unterschrift / eSignatur | | V2 |
| Automatische Rechnungsstellung | | V2 |
| Partnerportal (Pflegedienste) | | V2 |
| Mobile App (iOS/Android) | | V2 |

---

## Architektur & Techstack

```
Browser / Client
  React-Komponenten · Tailwind · Konfigurator-State
        ↕
Next.js App (Vercel, Edge Network)
  Pages + API Routes + Middleware (Auth-Guard) + Supabase Auth Sessions
        ↕
  ┌─────────────────┬──────────────────┬──────────────────┐
  │   PostgreSQL    │  Supabase Storage│   Resend (E-Mail)│
  │ Supabase (EU)   │  Produktfotos    │   Transaktional  │
  └─────────────────┴──────────────────┴──────────────────┘
```

| Schicht | Technologie | Begründung |
|---|---|---|
| Frontend | Next.js 14 (React) + TypeScript | SSR für SEO der öffentlichen Seiten, App Router für Kundenportal |
| Styling | Tailwind CSS | Schnelle Umsetzung des Design-Systems, keine separate CSS-Bibliothek nötig |
| Backend | Next.js API Routes | Für V1 ausreichend; bei V2 (Kassenschnittstellen) einfache Migration zu eigenem Node.js-Dienst |
| Datenbank | PostgreSQL via Supabase (EU-Frankfurt) | Relational, JSONB für Box-Snapshots, DSGVO-konform, tägliche Backups |
| ORM | Prisma | Typsichere Queries, einfache Migrationen; komplexe Reports via `prisma.$queryRaw` |
| Auth | Supabase Auth | Direkt in Supabase integriert, Row Level Security, kein zweites Auth-System nötig |
| Datei-Upload | Supabase Storage | EU-Server, kein extra Dienst, DSGVO-sauber — kein Cloudinary |
| E-Mail | Resend + React Email | Einfachste API, React-Komponenten für Templates, 3.000 Mails/Mo kostenlos |
| Job-Scheduling | Supabase pg_cron | Monatliche Lieferungen anlegen, Löschjobs, Token-Bereinigung |
| Hosting | Vercel (Hobby → Pro) | Zero-Config-Deployment, automatische Preview-Deployments, globales Edge Network. Für V2 (Kassenschnittstellen) Migration zu Coolify/Hetzner einplanen. |
| Monitoring | Sentry (mit PII-Scrubbing) | Error-Tracking Frontend + Backend, kostenlos bis 5.000 Errors/Mo |
| Versionierung | Git + GitHub Actions | CI/CD-Pipeline, automatische Tests vor Deployment |

> **Wichtig — Vercel Timeout:** Serverless Functions haben auf Vercel Pro ein Limit von 60 Sekunden. Der Admin-Lieferlisten-Export muss innerhalb dieser Grenze bleiben. Bei > 500 Kunden Pagination einbauen oder den Export als Hintergrund-Job via Supabase pg_cron + Download-Link lösen. Bei V2 (Kassenschnittstellen mit Long-Running-Prozessen) Migration zu Coolify/Hetzner einplanen.

---

## URL-Struktur

| Bereich | Pfad | Beschreibung |
|---|---|---|
| Öffentlich | `/` | Startseite |
| | `/wie-es-funktioniert` | Erklärungsseite |
| | `/produkte` | Öffentliche Produkt-Übersicht |
| | `/beantragen` | Registrierungs-Funnel (4 Schritte) |
| | `/danke` | Bestätigungsseite nach Registrierung |
| Auth | `/login` | Login für Kunden und Admins |
| | `/passwort-vergessen` | Passwort-Reset per E-Mail |
| Kunde | `/konto` | Dashboard |
| | `/konto/meine-box` | Box-Konfigurator |
| | `/konto/lieferungen` | Lieferverlauf |
| | `/konto/einstellungen` | Daten, Passwort, Account löschen |
| | `/konto/anfragen` | Support-Anfragen |
| Admin | `/admin` | Admin-Dashboard |
| | `/admin/kunden` | Kundenliste |
| | `/admin/kunden/[id]` | Kundendetail |
| | `/admin/produkte` | Produktverwaltung |
| | `/admin/lieferungen` | Lieferverwaltung |
| | `/admin/anfragen` | Support-Tickets |
| | `/admin/einstellungen` | System-Einstellungen (nur Superadmin) |

---

## Datenmodell

> `PK` = Primary Key, `FK` = Foreign Key. Alle IDs als UUID. Keine Umlaute in Feldnamen.

### users — Alle Nutzer (Kunden + Admins)

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | Eindeutige ID |
| email | varchar(255) | Login-E-Mail, einmalig |
| password_hash | varchar | bcrypt-Hash, niemals Klartext |
| rolle | enum | `kunde` / `admin` / `superadmin` |
| status | enum | `aktiv` / `gesperrt` / `geloescht` / `ausstehend` |
| email_bestaetigt | boolean | true nach Klick auf Bestätigungslink |
| erstellt_am | timestamp | Registrierungsdatum |
| letzter_login | timestamp | Für Audit-Zwecke |
| loeschung_beantragt_am | timestamp nullable | Wenn Kunde Account-Löschung beantragt |

### kunden_profile — Persönliche Pflegedaten

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| user_id `FK` | uuid | Referenz auf users.id |
| vorname | varchar(100) | Pflegebedürftiger — verschlüsselt |
| nachname | varchar(100) | Pflegebedürftiger — verschlüsselt |
| geburtsdatum | date | Pflegebedürftiger — verschlüsselt |
| pflegegrad | integer | 2–5 (kein Anspruch bei Pflegegrad 1) — verschlüsselt |
| krankenkasse | varchar(200) | Name der Pflegekasse |
| telefon | varchar(30) | Kontaktnummer |
| strasse | varchar(200) | Lieferadresse |
| plz | varchar(10) | |
| ort | varchar(100) | |
| angehoeriger_name | varchar(200) nullable | Falls Angehöriger den Antrag stellt |
| angehoeriger_verhaeltnis | varchar(100) nullable | z.B. „Tochter", „Ehemann" |
| lieferstichtag | integer | Tag des Monats, 1–28 |
| lieferung_status | enum | `aktiv` / `pausiert` / `gesperrt` |
| pausiert_bis | date nullable | Wenn pausiert: bis wann |

> **Hinweis:** Felder `vorname`, `nachname`, `geburtsdatum` und `pflegegrad` werden zusätzlich auf Anwendungsebene verschlüsselt (application-level encryption) — nicht nur Disk-Encryption.

### produkte — Katalog

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| name | varchar(200) | Produktname |
| kategorie | enum | `handschuhe` / `desinfektion` / `mundschutz` / `schutzkleidung` / `hygiene` / `sonstiges` |
| beschreibung | text | Max. 300 Zeichen |
| bild_url | varchar | Pfad in Supabase Storage |
| preis | decimal(8,2) | In Euro |
| varianten | jsonb nullable | `[{id, label, aufpreis}]` — z.B. Größen |
| hersteller | varchar(100) | |
| pflichtkennzeichnung | text nullable | Für Desinfektionsmittel etc. |
| aktiv | boolean | false = im Konfigurator nicht sichtbar |
| sortierung | integer | Reihenfolge im Konfigurator — via Admin per Drag & Drop (V2) oder Zahlenwert (V1) |
| erstellt_am | timestamp | |

> **Preisänderungs-Regel:** Wird ein Preis geändert, gilt er ab der nächsten aktiven Speicherung durch den Kunden. Das System warnt den Admin wenn eine Preisänderung bestehende Boxen über das Budget hebt.

### box_konfigurationen — Aktuelle Box je Kunde

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| kunde_id `FK` | uuid | Referenz auf kunden_profile.id |
| produkte | jsonb | `[{produkt_id, variante_id, menge}]` |
| gesamtpreis | decimal(8,2) | Summe zum Zeitpunkt der Speicherung |
| geaendert_am | timestamp | Letzte Änderung |
| geaendert_von | uuid nullable | user_id wenn Admin die Box geändert hat |

> **History-Hinweis:** Die aktuelle Box-Konfiguration wird hier gespeichert. Vergangene Zustände sind ausschließlich über `lieferungen.box_snapshot` rekonstruierbar — dieser Snapshot wird bei jeder Lieferung eingefroren.

### box_konfigurationen_verlauf — Änderungshistorie

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| kunde_id `FK` | uuid | |
| produkte | jsonb | Snapshot zum Zeitpunkt der Änderung |
| gesamtpreis | decimal(8,2) | |
| geaendert_am | timestamp | |
| geaendert_von | uuid nullable | |

### lieferungen — Monatlicher Lieferverlauf

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| kunde_id `FK` | uuid | |
| geplant_fuer | date | Datum der geplanten Lieferung |
| status | enum | `geplant` / `in_bearbeitung` / `versendet` / `zugestellt` / `storniert` |
| box_snapshot | jsonb | Kopie der Box-Konfiguration — unveränderlich |
| tracking_nummer | varchar nullable | Sendungsnummer Versanddienstleister |
| notizen | text nullable | Interne Admin-Notizen |
| erstellt_am | timestamp | |
| aktualisiert_am | timestamp | |

> **Lieferzyklus:** Ein pg_cron-Job läuft täglich und legt automatisch `lieferungen`-Einträge für Kunden an, deren Stichtag in 3 Tagen ist und deren Status `aktiv` ist.

### anfragen — Kundenanfragen

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| kunde_id `FK` | uuid | |
| kategorie | enum | `box` / `lieferung` / `adresse` / `loeschung` / `sonstiges` |
| betreff | varchar(200) | |
| nachricht | text | Freitext des Kunden |
| antwort | text nullable | Admin-Antwort |
| beantwortet_von `FK` | uuid nullable | user_id des Admins |
| status | enum | `offen` / `in_bearbeitung` / `beantwortet` / `geschlossen` |
| erstellt_am | timestamp | |
| beantwortet_am | timestamp nullable | |

> **Hinweis V1:** Anfragen unterstützen nur eine Antwort-Runde (kein Thread). Wenn Rückfragen nötig sind, wird eine neue Anfrage geöffnet. Thread-Modell für V2 vorgemerkt.

### einwilligungen — DSGVO-Nachweis

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| user_id `FK` | uuid | |
| typ | enum | `dsgvo` / `agb` / `marketing` |
| version | varchar | z.B. `AGB-2025-01` — Versionierung Pflicht |
| zeitpunkt | timestamp | |
| ip_adresse | varchar | |
| user_agent | varchar | |
| widerruf_am | timestamp nullable | |

### benachrichtigungen — In-App Notifications

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| user_id `FK` | uuid | |
| typ | enum | `lieferung_status` / `anfrage_beantwortet` / `system` |
| titel | varchar(200) | |
| gelesen | boolean | Default: false |
| link | varchar nullable | z.B. `/konto/anfragen/[id]` |
| erstellt_am | timestamp | |

### audit_log — Änderungsprotokoll

| Feld | Typ | Beschreibung |
|---|---|---|
| id `PK` | uuid | |
| user_id `FK` | uuid | Wer hat die Aktion ausgeführt |
| aktion | varchar(100) | z.B. `kunde.bearbeitet`, `lieferung.status_geaendert` |
| entitaet | varchar(50) | Welche Tabelle betroffen |
| entitaet_id | uuid | ID des betroffenen Datensatzes |
| alt_wert | jsonb nullable | Zustand vor der Änderung |
| neu_wert | jsonb nullable | Zustand nach der Änderung |
| ip_adresse | varchar(45) | |
| erstellt_am | timestamp | Unveränderlich — kein UPDATE/DELETE über API |

> **Datenbankebene:** Die audit_log-Tabelle hat einen separaten DB-Nutzer mit ausschließlich INSERT-Rechten. UPDATE und DELETE sind auf DB-Ebene gesperrt, nicht nur auf API-Ebene.

---

## Kundenportal

### Registrierungs-Flow (4 Schritte)

**Schritt 1 — Anspruch prüfen**  
Pflegegrad wählen (2–5; Pflegegrad 1 wird mit Erklärung abgewiesen) · Pflegeort bestätigen (zuhause) · Versicherungsart (gesetzlich/privat). System zeigt sofort: „Sie haben Anspruch auf bis zu 42 €/Monat."

**Schritt 2 — Persönliche Daten erfassen**  
Pflegebedürftiger: Vorname, Nachname, Geburtsdatum, Adresse, PLZ/Ort · Antragsteller (optional, wenn Angehöriger): Vorname, Nachname, Verhältnis · Krankenkasse (Freitext) · Telefonnummer · E-Mail · Passwort.

**Schritt 3 — Box zusammenstellen**  
Interaktiver Konfigurator mit Live-Budget-Counter (0–42 €).

**Schritt 4 — Bestätigung & Konto-Aktivierung**  
Zusammenfassung · DSGVO-Einwilligung + AGB (Pflichtfelder, mit Versionierung) · Wunsch-Lieferstichtag (1.–28.) · Absenden → Bestätigungs-E-Mail · Admin-Benachrichtigung.

### Dashboard-Funktionen

- Aktuelle Box (Produkte, Gesamtwert, letzter Versand)
- Nächste Lieferung (Datum, Status, Countdown)
- Letzte 3 Lieferungen mit Status
- Ungelesene Benachrichtigungen (Badge-Counter)
- Box bearbeiten (Konfigurator, Änderungen gelten ab nächster Lieferung)
- Lieferung pausieren (1–3 Monate) / reaktivieren / Stichtag ändern
- Kontaktdaten und Passwort ändern
- Anfrage stellen (Freitext, Kategorie wählbar)
- Account löschen (zweistufige Bestätigung, DSGVO-Löschung innerhalb 30 Tage)

---

## Box-Konfigurator

Das zentrale Differenzierungsmerkmal. Aufbau:

**Linke Spalte:** Kategorie-Filter · Budget-Fortschrittsbalken live · Mini-Box (aktuelle Auswahl mit Preisen) · Speichern-CTA (nur aktiv wenn Budget nicht überschritten)

**Rechte Spalte (Produktgrid):** Produktkarte mit Foto, Name, Kurzbeschreibung, Preis, Varianten-Auswahl, Checkbox · Produkte die Budget überschreiten würden werden ausgegraut · Deaktivierte Produkte erscheinen als „Momentan nicht verfügbar"

**Budget-Logik:** Das Limit (aktuell 42 €) ist im Admin konfigurierbar — kein Code-Deployment nötig bei gesetzlicher Änderung. Unterschreitung erlaubt, Überschreitung blockiert den Speichern-Button.

---

## Admin-Panel

### 1 — Dashboard
KPI-Übersicht: Aktive Kunden · Neue Anfragen · Lieferungen diesen Monat · Pausierte Konten. Tabelle der letzten 10 Aktionen. Kalender anstehender Lieferungen.

### 2 — Kundenverwaltung
Suche (Name, E-Mail, Kundennummer) · Filter (Status, Pflegegrad) · Detailansicht (alle Daten, Box-Konfiguration, Lieferverlauf, Anfragen, Änderungsprotokoll) · Bearbeiten · Sperren/Entsperren (Sperrgrund verpflichtend) · Löschen (Soft-Delete → Anonymisierung nach 30 Tagen; Hard-Delete nur Superadmin) · CSV/XLSX-Export.

### 3 — Produktverwaltung
CRUD · Bildupload (Supabase Storage, max. 2 MB, WebP-Konvertierung via sharp) · Deaktivierung (Produkt verschwindet aus Konfigurator, bleibt in alten Bestellungen sichtbar) · Löschen nur wenn nicht in aktiver Box · Produktstatistik (Beliebtheit) · Preisänderungs-Warnung bei Budget-Überschreitung.

### 4 — Bestellverwaltung & Lieferungen
Lieferliste generieren (filterbar nach Datum, Status, PLZ, exportierbar für Versanddienstleister) · Status-Management (Geplant → In Bearbeitung → Versendet → Zugestellt → Storniert) · Manuelles Pausieren für einzelne Kunden oder global (z.B. Betriebsferien).

### 5 — Anfragen & Support
Anfragen-Liste (sortiert nach Datum, filterbar nach Kategorie und Status) · Antworten (erscheint im Kundenkonto + E-Mail) · Status setzen · Admin-Benachrichtigung bei neuer Anfrage.

### 6 — System-Einstellungen (nur Superadmin)
Budget-Limit konfigurieren · Standard-Lieferstichtag · E-Mail-Templates anpassen · Admin-Accounts verwalten · Audit-Log einsehen · Admin-Benachrichtigungs-E-Mail konfigurieren.

---

## Sicherheit & DSGVO

### Technische Maßnahmen (TOMs)

**Authentifizierung**
- bcrypt Passwort-Hashing (Salt-Rounds ≥ 12)
- E-Mail-Verifikation (Token läuft nach 24h ab)
- Rate Limiting: max. 5 Fehlversuche, danach 15 min Sperrung
- Session-Timeout: 30 min Inaktivität (Kunde), 60 min (Admin)
- MFA (TOTP) für alle Admin-Accounts — Pflicht bei Art. 9-Daten
- Passwort-Reset: Token einmalig gültig, läuft nach 1h ab

**Verschlüsselung**
- TLS für alle Verbindungen (HTTPS erzwungen, HSTS-Header)
- Disk-Encryption durch Supabase (automatisch)
- Application-level Encryption für: `vorname`, `nachname`, `geburtsdatum`, `pflegegrad`

**Zugriffsschutz**
- Route-Guards (Middleware): `/konto/*` nur Kunden, `/admin/*` nur Admin/Superadmin
- Kunden sehen ausschließlich eigene Daten (API-Ebene + Row Level Security in Supabase)
- Separater DB-Nutzer für audit_log (nur INSERT)
- App-Datenbanknutzer: kein superuser, nur notwendige Rechte
- CSRF-Schutz (Supabase Auth integriert)

**Daten-Integrität**
- audit_log: INSERT-only auf DB-Ebene
- Box-Snapshots bei Lieferung eingefroren (JSONB, unveränderlich)
- Input-Validierung serverseitig (Zod)
- Tägliche automatische DB-Backups (Supabase), 30 Tage Aufbewahrung
- Backup-Restore vor Launch einmalig testen

### DSGVO-Anforderungen

**Rechtsgrundlagen (mit Anwalt klären)**
- Art. 6 Abs. 1 lit. b (Vertragserfüllung) für Lieferung
- Art. 9 Abs. 2 lit. a (ausdrückliche Einwilligung) für Gesundheitsdaten (Pflegegrad)

**Betroffenenrechte**
- Auskunft (Art. 15): Admin-Button exportiert alle Daten aus allen Tabellen als JSON/PDF. Frist: 1 Monat.
- Berichtigung (Art. 16): Kunden können vieles selbst ändern; Admin-Änderungen an Gesundheitsdaten werden dem Kunden per E-Mail bestätigt.
- Löschung (Art. 17): Automatisierter Job (pg_cron) führt Anonymisierung nach 30 Tagen durch. Erstreckt sich auf alle Systeme (DB, Sentry PII-Scrubbing, Resend E-Mail-Logs).
- Datenportabilität (Art. 20): JSON-Export erfüllt maschinenlesbares Format.

**Einwilligungsmanagement**
- Tabelle `einwilligungen` mit Versionierung (Pflicht bei AGB-Änderungen)
- DSGVO-Einwilligung + AGB-Timestamp mit IP-Adresse und User-Agent gespeichert

**Auftragsverarbeitungsverträge (AVV)**
- Supabase ✓ · Resend ✓ · Coolify/Hetzner ✓ · Sentry ✓ (PII-Scrubbing aktivieren)
- Kein Cloudinary (US-Server) — Supabase Storage stattdessen

**Datenpannen-Prozess (Art. 33/34)**
- 72-Stunden-Meldepflicht an LfD Niedersachsen
- Interner Prozess dokumentieren: Wer meldet was an wen
- Kunden direkt informieren wenn Risiko für Betroffene

**Verzeichnis der Verarbeitungstätigkeiten (VVT)**
- Vor Launch erstellen (Pflicht ab erster Verarbeitung personenbezogener Daten)
- Enthält: Zweck, Rechtsgrundlage, Aufbewahrungsfristen, Empfänger

**Google Fonts: Self-Hosting**
- Fonts lokal im Projekt hosten statt über Google CDN — verhindert Cookie-Consent-Pflicht für Fonts

---

## Benachrichtigungsstrategie

**Transaktionale E-Mails via Resend:**
- Registrierungsbestätigung (mit Aktivierungslink)
- Willkommens-E-Mail nach Aktivierung
- Lieferstatus-Updates (Versendet, Zugestellt)
- Anfrage beantwortet
- Sperrbenachrichtigung
- Passwort-Reset

**In-App Benachrichtigungen:**
- Tabelle `benachrichtigungen` (kein externer Dienst nötig für V1)
- Badge-Counter im Dashboard
- Novu oder ähnliche Multi-Channel-Lösung für V2 vorgemerkt

---

## Grober Zeitplan (12–18 Wochen)

| Woche | Meilenstein | Inhalt |
|---|---|---|
| 1–2 | Setup & Grundstruktur | Next.js-Projekt, Prisma-Schema, Supabase Auth, Design-System, Coolify/Hetzner Setup, CI/CD |
| 3–4 | Öffentliche Website | Alle Marketing-Seiten, responsives Layout |
| 5–6 | Registrierungs-Funnel & E-Mail | 4-Schritt-Formular, Zod-Validierung, E-Mail-Templates via Resend |
| 7–8 | Box-Konfigurator | Interaktiver Konfigurator, Live-Budget, Supabase Storage für Produktfotos |
| 9–10 | Kundenportal komplett | Dashboard, Lieferverlauf, Steuerung, Anfragen, Account-Löschung |
| 11–12 | Admin-Panel komplett | Alle Admin-Bereiche, Export-Funktionen, pg_cron Jobs |
| 13–14 | Sicherheit & DSGVO | MFA, application-level encryption, Löschjobs, Audit-Log, AVVs abschließen |
| 15–16 | Testing & QA | User-Flows, Browser-Tests, Performance, DSGVO-Checkliste, Security-Review |
| 17–18 | Soft Launch | Produktivdaten, Domain/SSL auf Vercel konfigurieren, Sentry aktivieren, erste Kunden, Bugfixing |

> **Hinweis:** Bei 1 Entwickler eher 20–24 Wochen einplanen. Die Wochen 13–14 (Sicherheit & DSGVO) sind bewusst als eigene Phase ausgewiesen — kein Nachgedanke.

---

## Offene Fragen vor Entwicklungsstart

- [ ] **Wer entwickelt?** Eigenes Team, Freelancer oder Agentur?
- [ ] **Produktliste für V1** — welche Produkte (Name, Beschreibung, Preis, Fotos) sind von Anfang an verfügbar?
- [ ] **Lieferstichtag-Logik** — freie Wahl 1–28 oder feste Stichtage (z.B. 1., 15.)?
- [ ] **Krankenkasse** — Freitext oder Dropdown mit häufigen Kassen?
- [ ] **Admin-Benachrichtigungs-E-Mail** — wohin gehen neue Registrierungen und Anfragen?
- [ ] **Datenschutzbeauftragter / Rechtliche Texte** — Datenschutzerklärung, AGB, Impressum müssen von einem Anwalt geprüft werden (Art. 9-Daten erfordern explizite Erwähnung)
- [ ] **Datenschutz-Folgenabschätzung (DSFA, Art. 35)** — bei systematischer Verarbeitung von Art. 9-Daten ggf. Pflicht, Anwalt fragen
- [ ] **Vercel Plan** — Hobby-Plan reicht für Entwicklung, für Produktion Vercel Pro (20 €/Mo) einplanen (60s Function Timeout, SLA, keine Bandbreitenlimits)

---

## Entscheidungslog

| Datum | Entscheidung | Begründung |
|---|---|---|
| Mär 2025 | Supabase Auth statt NextAuth | Direkte DB-Integration, Row Level Security, ein Dienst statt zwei |
| Mär 2025 | Supabase Storage statt Cloudinary | EU-Server, DSGVO-sauber, kein extra Dienst und kein extra AVV |
| Mär 2025 | Vercel statt Coolify/Hetzner (V1) | Schnellster Start, Zero-Config, Preview-Deployments. Migration zu Hetzner für V2 vorgemerkt. |
| Mär 2025 | Resend statt SendGrid | Einfachste API, React Email Integration, SendGrid zu komplex für V1 |
| Mär 2025 | pg_cron statt separatem Job-Scheduler | Läuft direkt in Supabase, kein extra Dienst nötig für V1 |
| Mär 2025 | Pflegegrad 1 ausgeschlossen | Kein Anspruch auf § 40 Abs. 2 SGB XI — fachlich korrekt |
| Mär 2025 | Keine Umlaute in DB-Feldnamen | Verhindert Quoting-Probleme in PostgreSQL und ORM |
| Mär 2025 | Einwilligungs-Tabelle mit Versionierung | DSGVO-Nachweis bei AGB-Änderungen, Art. 9-Anforderung |
| Mär 2025 | Application-level Encryption für Gesundheitsdaten | Art. 9 DSGVO — besondere Kategorie personenbezogener Daten |
