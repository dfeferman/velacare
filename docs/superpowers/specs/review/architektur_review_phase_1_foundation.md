# Architektur-Review – Phase 1 Foundation

## Executive Summary

Der vorliegende Plan für Phase 1 ist in seiner Struktur solide und geeignet, ein MVP-Fundament aufzubauen. Die Trennung von Authentifizierung (Supabase) und Domänenlogik (Prisma/PostgreSQL) ist architektonisch sinnvoll und reduziert initiale Komplexität.

Allerdings fehlen zentrale Entscheidungen in den Bereichen Autorisierung, Sicherheitsmodell, Datenhoheit und Betriebsmodell. Ohne diese Ergänzungen ist der Plan **nicht produktionsreif**, sondern eher als Delivery-Plan zu bewerten.

---

## Gesamtbewertung (Ampel)

| Bereich | Bewertung | Kommentar |
|--------|----------|----------|
| Architektur-Schnitt | 🟢 Grün | Saubere Trennung von Auth und Domain |
| Scope & Phasing | 🟢 Grün | Gute Reduktion auf Phase-1-Ziele |
| Authentifizierung | 🟢 Grün | Supabase Auth sinnvoll integriert |
| Autorisierung | 🔴 Rot | Unzureichend definiert |
| Datenmodell | 🟡 Gelb | Grundstruktur gut, Details fehlen |
| Sicherheit | 🔴 Rot | Kritische Aspekte zu spät eingeplant |
| Datenkonsistenz | 🟡 Gelb | Trigger vorhanden, aber nicht robust spezifiziert |
| Betrieb / Deployment | 🔴 Rot | Unklar und nicht reproduzierbar |

---

## 1. Architektur & Systemdesign

### Bewertung: 🟢 Grün

**Stärken:**
- Klare Trennung zwischen Auth (Supabase) und Domain (Prisma/Postgres)
- Reduktion auf `public.*` für Phase 1
- Mock-basierter Ansatz für nicht implementierte Module

**Empfehlungen:**
- Architekturdiagramm ergänzen (Auth Flow, Datenfluss, Trust Boundaries)
- Klar definieren: Server-only Zugriff vs. zukünftige Client-Zugriffe

---

## 2. Authentifizierung vs. Autorisierung

### Bewertung: 🔴 Rot

**Problem:**
Der Plan adressiert Authentifizierung korrekt, aber Autorisierung nur oberflächlich (Middleware).

**Risiken:**
- Ungeschützte Server Actions / API-Endpunkte
- Inkonsistente Rechteprüfung

**Empfehlung (verpflichtend):**

Einführen einer **mehrschichtigen Autorisierung**:

1. Middleware (Routing)
2. Server Guards (Business Logic)
3. Optional: DB-Level (RLS)

**Beispiel:**
```
if (!user || user.role !== 'admin') {
  throw new UnauthorizedError()
}
```

---

## 3. Rollenmodell & Datenhoheit

### Bewertung: 🔴 Rot

**Problem:**
Rollen existieren in zwei Quellen:
- JWT (`app_metadata`)
- Datenbank (`profiles.rolle`)

→ klassische Double Source of Truth

**Risiken:**
- Inkonsistente Berechtigungen
- Verzögerte Rollenänderungen

**Empfehlung:**

Klare Entscheidung treffen:

**Option A (empfohlen):**
- DB ist führend
- JWT enthält nur Cache

**Option B:**
- Auth ist führend
- DB speichert Rolle nicht oder nur als Spiegel

Zusätzlich:
- Token Refresh Strategie definieren
- Rollenänderungen invalidieren Sessions

---

## 4. Datenmodell & Constraints

### Bewertung: 🟡 Gelb

**Stärken:**
- Struktur grundsätzlich sinnvoll
- Trennung Profile / KundenProfile korrekt

**Fehlende Elemente:**

- Eindeutige Constraints:
  - 1:1 Profile ↔ KundenProfile
  - Unique-Regeln für Einwilligungen

- Indexstrategie:
  - FK-Spalten
  - Zeitbasierte Tabellen (Lieferungen etc.)

- JSONB Nutzung:
  - Schema-Konvention definieren
  - Indexierung (GIN falls nötig)

**Empfehlung:**
- Technisches Datenmodell inkl. Constraints dokumentieren
- Migrationen früh definieren

---

## 5. Trigger & Datenkonsistenz

### Bewertung: 🟡 Gelb

**Stärken:**
- Automatische Profil-Erstellung nach Signup

**Probleme:**
- Keine Idempotenz-Definition
- Fehlerfälle nicht behandelt

**Risiken:**
- Inkonsistente Daten
- Teilweise erstellte Entitäten

**Empfehlung:**

Trigger muss garantieren:

- Genau ein Profile pro User
- Transaktionale Erstellung
- Wiederholbarkeit (idempotent)

Zusätzlich:
- Logging bei Fehlern
- Retry-Strategie

---

## 6. Sicherheitsmodell

### Bewertung: 🔴 Rot

**Problem:**
Sicherheitsrelevante Themen werden auf spätere Phasen verschoben.

**Kritisch:**
- Speicherung sensibler Daten im Klartext
- Fehlende Verschlüsselungsstrategie

**Empfehlung (Phase 1 Pflicht):**

- Definition sensibler Felder
- Verschlüsselungsstrategie festlegen:
  - At-rest Verschlüsselung
  - Feldbasierte Verschlüsselung (falls nötig)

- Zugriffskontrolle definieren
- Secrets-Handling dokumentieren

---

## 7. RLS (Row Level Security)

### Bewertung: 🟡 Gelb

**Offene Frage:**
- Wird Supabase direkt vom Client genutzt?

**Empfehlung:**

- Wenn JA → RLS sofort implementieren
- Wenn NEIN → bewusst server-only Ansatz festlegen

---

## 8. Betrieb & Deployment

### Bewertung: 🔴 Rot

**Problem:**
Deployment-Strategie unklar („Free Tier → später Production“)

**Risiken:**
- Nicht reproduzierbare Umgebungen
- Manuelle Migrationen

**Empfehlung (verpflichtend):**

- Trennung:
  - dev
  - staging
  - prod

- Infrastruktur definieren:
  - Separate Projekte
  - Separate Secrets

- Migration-Workflow:
  - Prisma Migrations
  - Seed-Skripte

- Backup & Restore definieren

---

## 9. Audit & Logging

### Bewertung: 🟡 Gelb

**Aktueller Stand:**
- Insert-only angedacht

**Fehlend:**
- Welche Entitäten werden geloggt?
- Actor-Modell
- Before/After Werte

**Empfehlung:**

- Audit-Konzept definieren:
  - Wer hat was wann geändert?
  - Unveränderbarkeit

---

## 10. Konkrete To-Dos (Priorisiert)

### 🔴 Kritisch (vor Umsetzung klären)
- Autorisierungskonzept vollständig definieren
- Single Source of Truth für Rollen festlegen
- Deployment-Modell definieren
- Sicherheitsstrategie festlegen

### 🟡 Wichtig (parallel zu Phase 1)
- Datenbank-Constraints und Indizes definieren
- Trigger robust machen (idempotent)
- Audit-Strategie konkretisieren

### 🟢 Optional / später
- RLS (je nach Architekturentscheidung)
- Erweiterte Verschlüsselung

---

## Fazit

Der Plan ist ein **guter MVP-Startpunkt**, aber noch kein belastbares Architekturzielbild.

Mit den oben genannten Ergänzungen kann daraus eine robuste, produktionsfähige Architektur entstehen.

