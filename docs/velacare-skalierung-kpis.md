# Velacare — Skalierung & KPI-Schwellenwerte

**Datum:** März 2025  
**Version:** 1.0  
**Zweck:** Orientierungswerte für Stack-Entscheidungen, vertikale/horizontale Skalierung und Dienst-Wechsel

---

## Ampel-System

Alle Metriken folgen einem einheitlichen Schema:

| Farbe | Bedeutung |
|---|---|
| 🟢 Grün | Zielzustand — kein Handlungsbedarf |
| 🟡 Gelb | Beobachten — Maßnahmen vorbereiten |
| 🔴 Rot | Soforthandlung erforderlich |

---

## 1. Performance-KPIs

### Response-Zeiten & Verfügbarkeit

| Metrik | 🟢 Ziel | 🟡 Warnung | 🔴 Kritisch |
|---|---|---|---|
| Server Response Time (TTFB) | < 200ms | 200–600ms | > 600ms |
| Konfigurator Speichern (API) | < 400ms | 400ms–1s | > 1s |
| Admin Lieferliste Export | < 3s | 3–8s | > 8s → Timeout |
| Seiten-Ladezeit (LCP, Core Web Vitals) | < 2,5s | 2,5–4s | > 4s |
| Verfügbarkeit (Uptime) | > 99,5% | 99–99,5% | < 99% |
| Error Rate (5xx) | < 0,1% | 0,1–0,5% | > 0,5% |
| Datenbank Query-Zeit (p95) | < 50ms | 50–200ms | > 200ms |

> **Kritischer Endpunkt:** Der Admin-Lieferlisten-Export ist der wichtigste zu überwachende Endpunkt. Bei > 8s läuft er in Timeouts (Coolify/Hetzner haben keine harten Limits, aber Response-Timeout sollte trotzdem gesetzt werden).

### Velacare-spezifische Business-Metriken

| Metrik | 🟢 Ziel | 🟡 Warnung | Warum wichtig |
|---|---|---|---|
| Konfigurator Abschlussrate | > 60% | < 40% | Wer startet, soll auch speichern |
| Registrierung → E-Mail-Aktivierung | > 70% | < 50% | E-Mail-Zustellung prüfen |
| Anfragen ohne Antwort > 48h | < 5% | > 10% | Support-Qualität |
| E-Mail Bounce Rate (Resend) | < 2% | > 5% | Zustellbarkeit |
| Pausierte Lieferungen (Anteil) | < 15% | > 25% | Hoher Wert = Unzufriedenheit |
| Admin Export-Fehler | 0 | > 1/Woche | Datenverlust-Risiko |

---

## 2. Infrastruktur-KPIs (Hetzner VPS)

### Server-Ressourcen

| Metrik | 🟢 Ziel | 🟡 Warnung | 🔴 Kritisch → Maßnahme |
|---|---|---|---|
| CPU-Auslastung (Durchschnitt) | < 40% | 40–70% | > 70% → Vertikales Upgrade |
| RAM-Auslastung | < 60% | 60–80% | > 80% → Vertikales Upgrade |
| Disk I/O Wait | < 5ms | 5–20ms | > 20ms → SSD-Plan prüfen |
| Freier Festplattenplatz | > 40% | 20–40% | < 20% → Volume hinzufügen |
| Netzwerk-Durchsatz | < 50% des Limits | 50–80% | > 80% → Upgrade |

### Datenbankspezifisch (Supabase PostgreSQL)

| Metrik | 🟢 Ziel | 🟡 Warnung | 🔴 Kritisch → Maßnahme |
|---|---|---|---|
| Aktive DB-Connections | < 40 | 40–60 | > 60 → pgBouncer aktivieren |
| DB-Größe (Supabase Free: 500MB) | < 300MB | 300–450MB | > 450MB → Supabase Pro (25€) |
| Query p95 | < 50ms | 50–150ms | > 150ms → Index-Analyse |
| Cache Hit Rate | > 90% | 80–90% | < 80% → RAM erhöhen oder Query-Optimierung |
| Deadlocks | 0/Tag | 1–3/Tag | > 3/Tag → Transaktion-Analyse |
| Backup-Alter | < 24h | 24–48h | > 48h → Backup-Job prüfen |

---

## 3. Kostenschwellen je Dienst

### Monatliche Kosten — Wann handeln?

| Dienst | Aktuell (Free/Starter) | Überdenken ab | Wechsel/Upgrade ab |
|---|---|---|---|
| Hetzner VPS (CX21) | ~6 €/Mo | — | > 30 €/Mo (CX51+) → Architektur-Review |
| Supabase Free | 0 € | DB > 400MB | Supabase Pro: 25 €/Mo |
| Supabase Pro | 25 €/Mo | — | > 200 €/Mo → eigenes PostgreSQL |
| Resend Free | 0 € (3k/Mo) | > 2.000 Mails/Mo | Resend Scale: 20 €/Mo (50k) |
| Sentry Free | 0 € (5k Errors) | Regelmäßig over Budget | Team: 26 €/Mo |
| Gesamtstack | ~6–25 €/Mo | > 100 €/Mo | > 300 €/Mo → Architektur-Review |

> **Kostenwarnung Supabase:** Das Free-Tier hat eine wichtige Einschränkung — Projekte ohne Aktivität werden nach 7 Tagen pausiert. Für Produktion immer Supabase Pro nutzen (25 €/Mo).

---

## 4. Wann den Tech-Stack wechseln?

### Hetzner VPS → Größerer Server (vertikal skalieren)

**Upgrade von CX21 (2 vCPU, 4 GB) auf CX31 (2 vCPU, 8 GB) wenn:**
- RAM-Auslastung dauerhaft > 75%
- Oder: Next.js-Build schlägt wegen OOM fehl

**Upgrade auf CX41 (4 vCPU, 16 GB) wenn:**
- CPU dauerhaft > 60%
- Oder: Mehr als 5.000 aktive Kunden, DB-Connections > 100

**Kosten-Check:**

| Server | vCPU | RAM | Preis/Mo |
|---|---|---|---|
| CX21 | 2 | 4 GB | ~6 € |
| CX31 | 2 | 8 GB | ~11 € |
| CX41 | 4 | 16 GB | ~20 € |
| CX51 | 8 | 32 GB | ~38 € |

### Next.js API Routes → Separater Backend-Dienst

**Wechsel sinnvoll wenn eines davon zutrifft:**
- V2-Kassenschnittstellen kommen (Webhooks brauchen stabile Long-Running-Prozesse)
- API-Latenz > 600ms trotz DB-Optimierung
- Mehr als 3 Entwickler im Team (Monorepo wird zur Bremse)
- Mobile App geplant (sowieso eigene API nötig)

### Prisma → Drizzle ORM oder direktes SQL

**Wechsel sinnvoll wenn:**
- Lieferlisten-Queries > 200ms trotz Indexierung
- Prisma Cold-Start > 800ms bei Serverless-Deployment
- Komplexe Aggregationen (Reporting, Statistiken) nicht effizient darstellbar

> **Empfehlung für V1:** Prisma behalten, aber komplexe Reports via `prisma.$queryRaw` schreiben. Migration erst wenn tatsächliche Performance-Probleme auftreten.

### Supabase → eigenes PostgreSQL (auf Hetzner)

**Wechsel nur wenn alle drei Punkte zutreffen:**
- Supabase-Rechnung > 200 €/Mo dauerhaft
- Compliance-Anforderung nach vollständiger Datenkontrolle
- DevOps-Kapazität für eigene DB-Administration vorhanden

### Resend → Postmark

**Wechsel sinnvoll wenn:**
- Bounce Rate trotz Konfiguration > 5%
- Zustellbarkeit bei Transaktions-Mails kritisch geworden (Pflegebereich: Bestätigungs-Mails müssen ankommen)
- Monatliche Kosten Resend > 100 €/Mo

---

## 5. Skalierungsmaßnahmen — Reihenfolge & Aufwand

Die richtige Reihenfolge: immer erst die billigste und einfachste Maßnahme.

| Priorität | Maßnahme | Auslöser | Kosten | Aufwand |
|---|---|---|---|---|
| 1 | DB-Indexe optimieren | Query p95 > 50ms | 0 € | 1–2 Tage |
| 2 | pgBouncer aktivieren | Connections > 60 | 0 € (Supabase inkl.) | 2h |
| 3 | Supabase Pro upgraden | DB > 400MB oder Connections > 60 | +25 €/Mo | 1 Klick |
| 4 | Hetzner CX31 upgraden | RAM > 75% dauerhaft | +5 €/Mo | Neustart nötig |
| 5 | Redis/Upstash Caching | Gleiche Queries > 50×/Min | 0–10 €/Mo | 2–3 Tage |
| 6 | Read Replica hinzufügen | Read-Queries dominieren, Writes ok | +25–60 €/Mo | 1–2 Tage Code |
| 7 | Hetzner CX41 upgraden | CPU > 60% dauerhaft | +14 €/Mo | Neustart nötig |
| 8 | Backend auslagern (eigener Node.js-Dienst) | V2 mit Kassenschnittstellen | Entwicklungsaufwand | 2–4 Wochen |
| 9 | Eigenes PostgreSQL | Supabase > 200 €/Mo | Betriebsaufwand | Wochen |
| 10 | Horizontales Scaling (mehrere Server) | > 50.000 aktive Kunden | Komplex | Architekt nötig |

### Vertikales vs. Horizontales Scaling für Velacare

**Für Velacare ist vertikales Scaling in 99% der Fälle die richtige Wahl:**

Horizontales Scaling (mehrere Server, Load Balancer) macht erst Sinn wenn ein einzelner Server nicht mehr ausreicht — das ist bei einem Pflegehilfsmittel-Dienst für Deutschland frühestens bei > 50.000 aktiven Kunden der Fall. Ein CX51 für 38 €/Mo trägt problemlos 50.000 Kunden.

**Horizontale Komponenten die früher Sinn machen:**
- **Read Replica (ab ~5.000 Kunden):** Admin-Exporte und Reports auf Replica, Writes auf Primary
- **CDN für Produktfotos (sofort):** Supabase Storage hat CDN integriert — kostenlos nutzen

---

## 6. Kundenanzahl als Orientierung

| Aktive Kunden | Stack-Zustand | Empfohlene Maßnahmen |
|---|---|---|
| 0–500 | Alles Free/Starter, kein Engpass erwartet | Indexe anlegen, Monitoring einrichten, Backup testen |
| 500–2.000 | Supabase Free könnte DB-Limit erreichen | Supabase Pro (25 €/Mo), pgBouncer prüfen |
| 2.000–5.000 | Erste Caching-Überlegungen, Hetzner CX31 ggf. sinnvoll | Redis für Produktkatalog, Query-Analyse mit EXPLAIN |
| 5.000–20.000 | Stack-Kosten 50–150 €/Mo, ggf. Bottlenecks sichtbar | Read Replica, Architektur-Review für V2 |
| 20.000–50.000 | Hetzner CX41/CX51, eigenes PostgreSQL wird interessant | Backend-Dienst auslagern, Dedicated DB-Server |
| > 50.000 | Eigene Infrastruktur wirtschaftlich sinnvoll | Dedicated Server, eigenes PostgreSQL, DevOps-Stelle |

> **Realistisches Wachstum:** Mit einem soliden Marktstart in einer Bundesregion kann Velacare im ersten Jahr 200–1.000 aktive Kunden erreichen. Das Free-Tier von Supabase und Hetzner CX21 sind dafür mehr als ausreichend.

---

## 7. Monitoring-Setup

### Was ab Tag 1 überwacht werden sollte

| Tool | Was überwachen | Wie |
|---|---|---|
| Sentry | JavaScript-Fehler Frontend + Backend | Automatisch nach Setup |
| Supabase Dashboard | DB-Connections, Query-Performance, Speicher | Wöchentlich checken |
| Coolify | CPU, RAM, Disk des VPS | Dashboard |
| Resend Dashboard | Bounce Rate, Delivery Rate | Nach jedem E-Mail-Batch |
| Uptime Kuma | Verfügbarkeit (Endpunkt-Ping alle 60s) | Auf NAS deployen — kostenlos |

> **Uptime Kuma** ist eine selbst gehostete Monitoring-Lösung (läuft als Docker-Container auf dem NAS) die E-Mail oder Telegram-Alerts sendet wenn ein Endpunkt nicht erreichbar ist. Perfekte Ergänzung zu Sentry.

### Alerts die sofort eingerichtet werden sollten

- Verfügbarkeit < 99% → sofortige Benachrichtigung
- Error Rate > 0,5% → sofortige Benachrichtigung  
- DB-Connections > 60 → Warnung
- Disk > 80% voll → Warnung
- Backup älter als 48h → Warnung
- Bounce Rate > 5% → Warnung

---

## 8. Checkliste vor Launch

### Muss vor Launch erledigt sein

- [ ] Sentry installiert und PII-Scrubbing konfiguriert
- [ ] Uptime-Monitoring eingerichtet (Uptime Kuma oder ähnlich)
- [ ] Backup-Restore einmal getestet
- [ ] AVV mit Supabase, Hetzner, Resend, Sentry abgeschlossen
- [ ] Alle DB-Indexe für häufige Queries angelegt
- [ ] pgBouncer konfiguriert (auch wenn noch nicht nötig — Vorbereitung)
- [ ] Export-Endpoint auf Timeout-Verhalten getestet
- [ ] Datenpannen-Prozess intern dokumentiert (72h-Meldepflicht LfD Niedersachsen)

### Sollte vor Launch erledigt sein

- [ ] Staging-Umgebung auf Coolify eingerichtet (Preview-Deployments)
- [ ] Automatisierter Löschjob (pg_cron) getestet
- [ ] Performance-Test Konfigurator mit 50 gleichzeitigen Requests
- [ ] E-Mail-Templates auf Spam-Score geprüft (mail-tester.com)
