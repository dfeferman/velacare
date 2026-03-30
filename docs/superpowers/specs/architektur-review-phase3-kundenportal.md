# Architektur-Review – Phase 3 „Kundenportal (echte Daten)“

## Executive Summary

Der Plan ist in seiner Grundstruktur solide. Besonders positiv ist die klare Trennung zwischen:

- Server Components für Datenladen
- DAL-Funktionen für Reads
- Server Actions für Writes
- Client Components nur für UI-State

Das ist aus Sicht von Softwarearchitektur gut geschnitten und für Next.js/Supabase/Prisma eine vernünftige Zielstruktur. Auch die Scope-Begrenzung ist klug: kein unnötiger Umbau der UI, sondern ein fokussierter Austausch des Datenlayers.

Mein Gesamturteil: **guter Phase-3-Plan mit belastbarer Grundarchitektur, aber noch mit mehreren fachlich-technischen Unschärfen**, vor allem bei **Datenkonsistenz, Ownership der Box-Konfiguration, Berechtigungsprüfung auf Write-Ebene und Stabilität gegenüber Randfällen**.

---

## Gesamtbewertung (Ampel)

| Bereich | Bewertung | Kommentar |
|---|---|---|
| Architektur-Schnitt | 🟢 Grün | Gute Trennung von Reads, Writes und UI |
| Scope & Phasing | 🟢 Grün | Sauber begrenzt, realistisch umsetzbar |
| Read-Modell / DAL | 🟢 Grün | Klar und wartbar |
| Write-Modell | 🟡 Gelb | Einfach und praktikabel, aber noch zu grob abgesichert |
| Autorisierung | 🟡 Gelb | Basis vorhanden, Defense in Depth noch nicht vollständig |
| Datenmodell | 🟡 Gelb | Funktional okay, aber mit strukturellen Folgeproblemen |
| Fehler- und Null-Semantik | 🟡 Gelb | Angedacht, aber fachlich noch unpräzise |
| Änderbarkeit / Zukunftsfähigkeit | 🟡 Gelb | Gut für Phase 3, aber mit späterem Refactoring-Bedarf |

---

## 1. Scope, Phasing und Schnitt der Phase

### Bewertung: 🟢 Grün

Die Phase ist gut zugeschnitten. Sie aktiviert das Kundenportal auf echten Daten, ohne gleichzeitig Produktkatalog, Benachrichtigungen, Löschlogik oder Liefersteuerung mitzuziehen. Das ist architektonisch vernünftig, weil damit genau ein begrenzter fachlicher Raum produktiv gemacht wird.

Besonders gut ist, dass Schreiboperationen stark begrenzt sind:

- Box ändern
- Anfrage anlegen

Das reduziert Komplexität und macht die Phase handhabbar.

---

## 2. Grundarchitektur und Layering

### Bewertung: 🟢 Grün

Die beschriebene Zielarchitektur ist der stärkste Teil des Dokuments.

- DAL (`konto.ts`) für Reads
- Server Actions für Writes
- Server Components für Daten
- Client Components nur für UI

Das vermeidet typische Probleme wie unnötige Client-Fetches oder doppelte Logik.

---

## 3. Authentifizierung und Autorisierung

### Bewertung: 🟡 Gelb

Auth ist vorhanden, aber Autorisierung noch zu implizit.

Fehlend:
- Harte Ownership-Regeln
- Klare Invarianten für Zugriff auf Daten

Empfehlung:
- Jede Write-Action validiert:
  - eingeloggter User
  - existierendes Profil
  - Ownership der Daten

---

## 4. Data Access Layer

### Bewertung: 🟢 Grün

Sehr gute Struktur.

Verbesserung:
- Einführung von View-Modellen statt roher Prisma-Objekte

---

## 5. Null-Handling und Profil-Lifecycle

### Bewertung: 🟡 Gelb

`null` ist technisch korrekt, aber fachlich zu unscharf.

Empfehlung:
- Explizite Zustände definieren:
  - kein Profil (unbestätigt)
  - inkonsistent
  - gültig

---

## 6. Write-Operation Box

### Bewertung: 🟡 Gelb

Probleme:
- Keine klare Definition: wie viele Boxen pro Kunde?
- Kein Schutz gegen parallele Änderungen

Empfehlung:
- Genau eine aktive Box definieren
- Optional Versioning / Optimistic Locking

---

## 7. Snapshot-Strategie

### Bewertung: 🟡 Gelb

Problem:
- Mock-Produkte als Basis

Risiko:
- Migration zu echten Produkten schwierig

Empfehlung:
- Klare Definition:
  - Snapshot vs. Referenz

---

## 8. Anfrage-System

### Bewertung: 🟢 Grün

Gut strukturiert.

Verbesserung:
- Validierung erweitern
- Rate Limiting einführen

---

## 9. Lieferungen

### Bewertung: 🟡 Gelb

Problem:
- Berechnung von Werten on-the-fly

Empfehlung:
- Fachlich relevante Werte persistieren

---

## 10. Einstellungen

### Bewertung: 🟡 Gelb

Problem:
- Daten kommen aus zwei Quellen (Auth + DB)

Empfehlung:
- Source of Truth definieren

---

## 11. Migrationen

### Bewertung: 🟡 Gelb

Keine Migration technisch korrekt, aber:

- Fachliche Entscheidungen fehlen

---

## 12. To-Dos

### 🔴 Kritisch
- Ownership Box definieren
- Autorisierung härten
- Profil-Zustände definieren

### 🟡 Wichtig
- Snapshot-Strategie
- Validierung erweitern
- Concurrency klären

### 🟢 Optional
- View-Model Layer
- Fehler-Typisierung

---

## Fazit

**Bester Plan bisher aus Architektursicht**, aber noch mit offenen fachlichen Invarianten.

Mit sauberen Entscheidungen in:
- Ownership
- Datenmodell
- Autorisierung

wird daraus eine stabile Grundlage für Phase 4.
