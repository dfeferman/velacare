# Architektur-Review: Phase 5 E-Mail & Jobs

> Datum: 30.03.2026
> Review-Ziel: `docs/superpowers/plans/2026-03-30-phase5-email-jobs.md`
> Fokus: Umsetzbarkeit, Betriebsstabilität, Sicherheits- und Architekturqualität

---

## Kurzfazit

Der Plan ist insgesamt gut strukturiert, konkret und für die Implementierung brauchbar. Positiv sind vor allem die saubere Gliederung in Tasks, die klare Trennung von Templates und Versandlogik sowie die vorgesehenen manuellen Prüfungen.

Für eine robuste Produktionsumsetzung fehlen aber an einigen Stellen noch wichtige Präzisierungen. Die größten Risiken liegen im Magic-Link-Flow mit Supabase, in der fehlenden Idempotenz des monatlichen Reminder-Jobs, in zu fragilen Infrastrukturannahmen rund um Environment-Variablen sowie in der operativen Wartbarkeit der `pg_cron`-Migration.

Dieses Review empfiehlt, den Plan vor der Umsetzung in den unten genannten Punkten zu schärfen.

---

## Was bereits gut gemacht wurde

### 1. Gute Zerlegung in umsetzbare Arbeitspakete

Der Plan ist in klar abgegrenzte Tasks mit konkreten Dateien, Beispielcode und Validierungsschritten unterteilt. Das reduziert Interpretationsspielraum und macht die Umsetzung auch für mehrere Bearbeiter gut delegierbar.

Positiv:
- konkrete Dateipfade statt abstrakter Module
- logische Reihenfolge von Dependencies, Infrastruktur, Templates, Integration und Cron
- jeder Task endet mit einem Prüf- oder Commit-Schritt

### 2. Saubere Trennung von Rendering und Versand

Die vorgesehene Aufteilung in:
- `src/emails/*` für Templates
- `src/lib/email/resend.ts` für den Client
- `src/lib/email/sender.ts` für den Versand

ist architektonisch sinnvoll. Dadurch bleiben Templates testbar, austauschbar und unabhängig von der Delivery-Implementierung.

### 3. Fehler-Isolation beim transaktionalen E-Mail-Versand

Dass der Versand der Bestellbestätigung die Registrierung nicht rückgängig machen soll, ist eine gute Entscheidung. E-Mail-Versand ist ein Nebeneffekt und sollte den Kernprozess nicht unkontrolliert scheitern lassen.

### 4. Pragmatistische Qualitätssicherung

Der Plan berücksichtigt die reale Projektsituation ohne automatisierte Tests und ergänzt deshalb sinnvolle manuelle Prüfungen:
- `npm run build`
- Template-Preview
- End-to-End-Test des Magic-Link-Flows
- manueller Test der Cron-Route

Das ist für den aktuellen Reifegrad des Repos angemessen.

### 5. Sinnvolle Baseline-Sicherheit für Cron-Routen

Die Absicherung des Webhooks über `CRON_SECRET` ist als Mindestmaß richtig. Für interne Cron-Endpunkte ist das ein pragmatischer und verständlicher Startpunkt.

---

## Konkrete Verbesserungen

## 1. Magic-Link-Flow technisch präzisieren und gegen aktuelle Supabase-API prüfen

### Problem

Der Plan beschreibt den OTP-Flow mehrfach unterschiedlich und teilweise mit hoher Wahrscheinlichkeit nicht API-konform:
- im Plan wird `verifyOtp({ token_hash, type: 'magiclink' })` verwendet
- im ergänzenden Design-Dokument wird zusätzlich `exchangeCodeForSession(token_hash)` erwähnt
- `generateLink({ type: 'magiclink' })` und der Callback-Parameter `type=magiclink` werden als gesetzt angenommen

Das ist riskant, weil Auth-Flows bei Supabase in Details empfindlich sind. Wenn der Typ oder der Callback-Mechanismus nicht exakt zur aktuellen API passt, ist der Login-Flow zwar implementiert, aber in Produktion faktisch defekt.

### Verbesserungsvorschlag

Den Plan vor der Umsetzung auf genau einen dokumentierten und verifizierten Flow festziehen:

1. Entscheiden, welcher Supabase-Flow offiziell unterstützt und aktuell ist:
- `admin.generateLink(...)`
- welcher `type` dabei zurückkommt oder benötigt wird
- welcher Callback-Mechanismus exakt genutzt wird

2. Im Plan nur noch einen verbindlichen Callback-Flow beschreiben.

3. Im Plan zusätzlich festhalten:
- welche Query-Parameter der Callback erwartet
- ob `next` zugelassen wird
- wie mit ungültigen, abgelaufenen oder mehrfach verwendeten Links umgegangen wird

### Empfohlene Ergänzung im Plan

Einen kleinen Abschnitt "Auth-Flow-Entscheidung" hinzufügen:

```md
## Auth-Flow-Entscheidung

Für Phase 5 wird genau ein Supabase-Magic-Link-Flow unterstützt. Vor Implementierungsbeginn ist der konkrete API-Call gegen die aktuelle Supabase-Dokumentation zu verifizieren. Callback-Parameter, erlaubter `type` und Session-Erzeugung müssen 1:1 dokumentiert und anschließend konsistent in Plan und Code verwendet werden.
```

---

## 2. Versandstrategie nach Registrierung fachlich klar entscheiden

### Problem

Der Plan führt zwei unterschiedliche transaktionale E-Mails direkt rund um `registerKunde()` ein:
- Bestellbestätigung
- Magic-Link-E-Mail

Aktuell ist nicht klar geregelt, ob beide E-Mails unmittelbar nacheinander versendet werden sollen. Das kann UX-seitig zu unnötiger Komplexität führen:
- zwei Mails innerhalb weniger Sekunden
- unklare Erwartung beim Nutzer
- höheres Risiko für Zustellprobleme oder Verwirrung

### Verbesserungsvorschlag

Vor der Umsetzung eine verbindliche Produktentscheidung dokumentieren:

Option A:
- separate Bestellbestätigung
- separate Magic-Link-E-Mail

Option B:
- nur eine kombinierte E-Mail mit Bestellbestätigung plus Login-Link

Option C:
- Bestellbestätigung sofort
- Magic-Link nur bei expliziter Konto-Nutzung oder erneutem Login-Wunsch

### Empfehlung

Für Phase 5 ist Option B die stabilste und nutzerfreundlichste Variante:
- weniger Mail-Aufkommen
- weniger Zustellrisiko
- klarere Kommunikation

Falls fachlich zwei E-Mails gewünscht sind, sollte das im Plan ausdrücklich begründet werden.

### Empfohlene Ergänzung im Plan

```md
## Versandentscheidung nach Registrierung

Nach erfolgreicher Registrierung wird [genau eine / genau zwei] E-Mail(s) versendet.
Begründung: ...
Wenn zwei E-Mails versendet werden, muss die Reihenfolge, der Zweck jeder Mail und die erwartete Nutzerführung explizit dokumentiert werden.
```

---

## 3. Monatlichen Reminder-Job idempotent machen

### Problem

Die aktuelle Cron-Route sendet Erinnerungen an alle aktiven Kunden ohne Lieferung im laufenden Monat. Es gibt aber keinen Schutz gegen Mehrfachversand bei:
- erneutem Cron-Lauf
- manueller Wiederholung
- Deploy-/Retry-Szenarien
- partiellen Fehlern während der Verarbeitung

Das ist für einen Hintergrundjob ein zentrales Betriebsrisiko.

### Verbesserungsvorschlag

Vor dem Versand einen persistierten Versandstatus einführen. Mögliche Varianten:

Option A:
- neue Tabelle `email_deliveries`
- Felder z.B. `kind`, `kundeId`, `periodKey`, `sentAt`, `providerMessageId`
- Unique-Constraint auf `(kind, kundeId, periodKey)`

Option B:
- Feld im Kundenprofil wie `lastMonthlyReminderSentAt`

Option A ist klar vorzuziehen, weil sie auditierbar, erweiterbar und für spätere Mailtypen wiederverwendbar ist.

### Empfehlung

Den Plan um einen zusätzlichen Task erweitern:
- Versandlog-Modell in Prisma anlegen
- Reminder nur senden, wenn für `(monthly-reminder, kundeId, YYYY-MM)` noch kein Eintrag existiert
- nach erfolgreichem Versand Eintrag persistieren

### Nutzen

- keine doppelten Erinnerungen
- bessere Nachvollziehbarkeit
- stabilere Retries
- Grundlage für spätere Reporting- und Support-Fälle

---

## 4. Cron-Verarbeitung auf Batching oder Queueing auslegen

### Problem

Die aktuelle Route verarbeitet alle Empfänger seriell in einem Request. Das ist einfach, aber betrieblich schwach:
- lange Laufzeit
- erhöhte Timeout-Gefahr
- schlechte Fehlerisolierung
- bei wachsender Kundenzahl nicht mehr tragfähig

### Verbesserungsvorschlag

Mindestens Batching in den Plan aufnehmen:
- Empfänger in Blöcken verarbeiten, z.B. 50 oder 100 pro Durchlauf
- Ergebniszahlen getrennt für `processed`, `sent`, `failed`, `skipped`

Mittelfristig besser:
- Cron erzeugt nur Jobs
- ein Worker oder ein separater Trigger sendet die E-Mails

### Empfehlung für Phase 5

Wenn bewusst pragmatisch gestartet werden soll, dann:
- Batch-Verarbeitung einbauen
- harte Obergrenze pro Lauf definieren
- Logging der Fehler pro Batch ergänzen

So bleibt die Umsetzung überschaubar, aber deutlich robuster.

---

## 5. `sendEmail()` robuster gegenüber fehlender Konfiguration machen

### Problem

Der vorgeschlagene Resend-Client wirft bereits beim Modulimport, wenn `RESEND_API_KEY` fehlt. Das ist zu aggressiv:
- lokale Entwicklung wird unnötig fragil
- Builds können scheitern, obwohl die aufrufenden Codepfade gar nicht verwendet werden
- Debugging wird schwerer

Zusätzlich ist der Fallback auf `noreply@velacare.de` problematisch, wenn die Domain in Resend nicht verifiziert ist.

### Verbesserungsvorschlag

`sendEmail()` oder `getResendClient()` sollte die Konfiguration lazy prüfen:

```ts
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(apiKey)
}
```

Zusätzlich:
- `RESEND_FROM` als verpflichtend behandeln
- kein stiller Produktiv-Fallback auf `noreply@velacare.de`
- optional in Dev ein expliziter Sandbox-Absender

### Empfehlung

Im Plan klar festhalten:
- welche Env-Vars mandatory sind
- welche nur in Dev erlaubt anders gesetzt werden dürfen
- an welcher Stelle sie validiert werden

---

## 6. Öffentliche und serverseitige Basis-URLs trennen

### Problem

Der Plan verwendet `NEXT_PUBLIC_APP_URL` für serverseitig erzeugte Links in E-Mails und Cron-Routen. Das vermischt Frontend-Konfiguration mit serverseitiger Betriebslogik.

### Verbesserungsvorschlag

Eine eigene serverseitige Variable verwenden:

```bash
APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Regel:
- `APP_URL` für E-Mails, Redirects, Webhooks, Cron
- `NEXT_PUBLIC_*` nur für Browser-seitige Nutzung

### Nutzen

- sauberere Verantwortlichkeiten
- weniger Fehlkonfiguration
- bessere Trennung zwischen öffentlicher und interner Konfiguration

---

## 7. `pg_cron`-Migration wartbar und idempotent formulieren

### Problem

Die Migration legt direkt einen benannten Cron-Job an, ohne den Umgang mit Re-Runs, Änderungen oder Umgebungstrennung sauber zu definieren.

Risiken:
- Job existiert bereits
- Schedule muss später geändert werden
- Preview- und Prod-Umgebungen weichen voneinander ab

### Verbesserungsvorschlag

Im Plan dokumentieren:
- wie bestehende Jobs erkannt werden
- wie ein Schedule geändert wird
- ob Cron nur in Production aktiv sein soll
- wie Dev/Preview ohne echte externe Calls getestet wird

### Empfehlung

Eine Ergänzung im Plan:

```md
Vor dem Anlegen des Cron-Jobs muss geprüft werden, ob bereits ein Job mit demselben Namen existiert.
Für Schedule-Änderungen wird ein definierter Update-Pfad dokumentiert.
Preview- oder Dev-Umgebungen dürfen keinen produktionsnahen Reminder-Job automatisch aktivieren.
```

---

## 8. Fehlerszenarien und Logging gezielter planen

### Problem

Aktuell wird im Wesentlichen nur `console.error(...)` vorgesehen. Das ist für frühe Entwicklung ok, aber für Jobs und transaktionale E-Mails zu wenig aussagekräftig.

### Verbesserungsvorschlag

Im Plan mindestens folgende Logging-Felder vorsehen:
- Mailtyp
- Empfänger
- fachlicher Kontext, z.B. `kundeId`
- Fehlerklasse
- Provider-Fehler, falls vorhanden
- Anzahl gesendet / fehlgeschlagen / übersprungen

Für Cron besonders wichtig:
- Startzeit
- Laufzeit
- Batch-Größe
- Gesamtmenge

### Empfehlung

Kein komplexes Logging-System erzwingen, aber strukturierte Logs im Code ausdrücklich vorsehen.

---

## 9. Dokument-Encoding bereinigen

### Problem

Sowohl Plan als auch zugehöriges Design-Dokument enthalten Mojibake-Zeichen wie:
- `dÃ¼nner`
- `BestellbestÃ¤tigung`
- `â€”`

Das ist kein rein kosmetisches Problem. Gerade bei Doku für Mails, URLs, Copy und Codebeispielen senkt das die Lesbarkeit und erhöht Review-Fehler.

### Verbesserungsvorschlag

Alle betroffenen Markdown-Dateien in UTF-8 normalisieren und danach erneut prüfen:
- Plan
- Design-Dokument
- ggf. weitere neu erstellte Phase-5-Dokumente

---

## Empfohlene Plan-Anpassungen vor Umsetzung

1. Auth-Flow mit Supabase auf einen einzigen, dokumentierten und verifizierten Magic-Link-Mechanismus festziehen.
2. Klare Produktentscheidung treffen, ob nach Registrierung eine oder zwei E-Mails versendet werden.
3. Reminder-Versand idempotent machen, idealerweise über eine dedizierte Versandlog-Tabelle.
4. Cron-Verarbeitung mindestens batchfähig machen.
5. `sendEmail()` und Resend-Konfiguration lazy und explizit validieren.
6. `APP_URL` als serverseitige Basis-URL einführen.
7. Cron-Migration um Betriebs- und Wartungshinweise ergänzen.
8. Dokument-Encoding bereinigen.

---

## Empfohlene Einstufung

### Status

Freigabefähig mit Überarbeitung.

### Begründung

Die Grundstruktur ist stark genug, um darauf weiterzuarbeiten. Für eine belastbare Implementierung sollten die genannten Punkte aber vor dem Coding geschärft werden. Besonders der Auth-Flow und die Idempotenz des Reminder-Jobs sollten nicht erst während der Implementierung improvisiert werden.
