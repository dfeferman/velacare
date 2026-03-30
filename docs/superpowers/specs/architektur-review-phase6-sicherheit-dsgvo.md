# Architektur-Review: Phase 6 Sicherheit & DSGVO

> Datum: 30.03.2026
> Review-Ziel: `docs/superpowers/specs/2026-03-30-velacare-phase6-sicherheit-dsgvo-design.md`
> Fokus: Sicherheitsarchitektur, Betriebsstabilität, Datenmodell, Umsetzbarkeit

---

## Kurzfazit

Das Dokument setzt an den richtigen Themen an: Verschlüsselung sensibler Daten, Manipulationsschutz für Audit-Logs, saubere Fehlerkompensation bei verteilten Writes und MFA für Admins. Die Richtung ist insgesamt richtig und für ein Produkt mit Gesundheitsbezug angemessen.

In der aktuellen Fassung ist das Design aber noch nicht belastbar genug für eine direkte Umsetzung. Die größten Schwächen liegen in fehlender Migrationsstrategie für bestehende Daten, in einer gefährlichen Wechselwirkung zwischen Verschlüsselung und Audit-Log, in einer unklaren MFA-Zieldefinition sowie in mehreren Architekturdetails, die den operativen Betrieb später erschweren würden.

Die Phase sollte vor der Implementierung fachlich und technisch nachgeschärft werden.

---

## Was bereits gut gemacht wurde

### 1. Die richtigen Sicherheitsbaustellen werden adressiert

Die vier gewählten Themen sind sinnvoll priorisiert:
- Verschlüsselung von besonders sensiblen Daten
- Unveränderbarkeit des Audit-Trails
- Konsistenz über Systemgrenzen hinweg
- Zweiter Faktor für privilegierte Accounts

Das ist eine gute Auswahl für eine Sicherheitsphase.

### 2. AES-256-GCM ist eine vernünftige kryptografische Grundentscheidung

Die Wahl von AES-256-GCM mit zufälligem IV und Auth-Tag ist für application-level encryption ein sauberer Standardansatz. Positiv ist auch, dass bewusst ein AEAD-Verfahren statt einer reinen Verschlüsselung ohne Integrität gewählt wurde.

### 3. Die Verschlüsselung in der DAL zu verankern ist grundsätzlich richtig

Die Entscheidung, Verschlüsselung nicht querbeet in UI, Server Actions oder Prisma-Callsites zu verteilen, sondern in der Data-Access-Schicht zu bündeln, ist gut. Dadurch bleibt die Verantwortung klar und die Gefahr inkonsistenter Einzelimplementierungen sinkt.

### 4. Die Compensation-Idee für `registerKunde()` ist architektonisch sinnvoll

Der Plan erkennt korrekt, dass Auth und Applikationsdaten nicht in einer gemeinsamen Transaktion liegen und deshalb aktiv kompensiert werden müssen. Das ist ein guter Blick auf reale Systemgrenzen.

### 5. Für MFA wird ein nachvollziehbarer Supabase-Flow gewählt

Das Dokument lehnt sich beim Grundprinzip an die Supabase-MFA-Mechanik mit AAL-Prüfung an. Der technische Ansatz ist im Kern plausibel und gut anschlussfähig an die bestehende Auth-Architektur.

---

## Konkrete Verbesserungen

## 1. Zieldefinition für MFA ist widersprüchlich

### Problem

Gleich am Anfang wird "TOTP-Pflicht für alle Admin-Logins" als Maßnahme genannt. Später steht ausdrücklich, dass MFA in Phase 6 optional bleibt.

Das ist kein kleiner Formulierungsfehler, sondern eine zentrale Widersprüchlichkeit:
- Pflicht-MFA und optionale MFA führen zu unterschiedlichen Flows
- unterschiedliche UI-Anforderungen
- unterschiedliche Anforderungen an `requireAdmin()`
- unterschiedliche Rollout- und Support-Konsequenzen

### Verbesserungsvorschlag

Vor Umsetzung exakt festlegen:

Option A:
- MFA ist in Phase 6 optional
- nur Enrollment und Challenge-Flow werden gebaut

Option B:
- MFA ist in Phase 6 verpflichtend
- Enrollment wird beim ersten Admin-Login erzwungen

### Empfehlung

Wenn Geschwindigkeit wichtig ist, Phase 6 klar als "MFA optional, aber technisch vollständig vorbereitet" definieren. Dann muss der Titel und die Zielbeschreibung angepasst werden, damit Pflicht-MFA nicht implizit versprochen wird.

---

## 2. Es fehlt eine Datenmigrations- und Backfill-Strategie für bestehende Klartextdaten

### Problem

Das Dokument beschreibt, dass `geburtsdatum` und `pflegegrad` im Prisma-Schema auf `String` wechseln und künftig verschlüsselt gespeichert werden. Es fehlt aber vollständig:
- wie bestehende Datensätze migriert werden
- wie Deploy und Backfill zusammenspielen
- wie ein Rollback aussehen würde
- ob es eine Übergangsphase mit dual-read oder dual-write gibt

Ohne diese Strategie ist die Umsetzung riskant. Bereits vorhandene Datensätze bleiben sonst im Klartext oder werden beim Schemawechsel unlesbar.

### Verbesserungsvorschlag

Den Plan um einen dedizierten Migrationspfad erweitern:

1. Neue verschlüsselte Zielspalten anlegen oder bestehende Spalten kontrolliert migrieren.
2. Backfill-Skript definieren, das alle Altbestände verschlüsselt.
3. Deploy-Reihenfolge dokumentieren.
4. Validierung nach dem Backfill festlegen.
5. Erst danach alte Klartextnutzung entfernen.

### Empfehlung

Für Produktionssicherheit ist eine zweistufige Migration meist besser:
- zuerst Code, der beide Formate lesen kann
- danach kontrollierter Backfill
- erst anschließend hartes Umschalten

---

## 3. Audit-Log kann unbeabsichtigt sensible Klartextdaten konservieren

### Problem

Das Dokument schlägt für `updateKundenBox()` "vorher/nachher als JSONB" vor. Gleichzeitig sollen sensible Felder auf Anwendungsebene verschlüsselt werden.

Damit entsteht ein gefährlicher Zielkonflikt:
- Produktionsdaten werden verschlüsselt
- Audit-Log könnte dieselben Inhalte unverschlüsselt als Diff oder Snapshot speichern

Das würde die Schutzwirkung der Verschlüsselung teilweise aushebeln und ist gerade in einer Phase mit "Sicherheit & DSGVO" problematisch.

### Verbesserungsvorschlag

Für Audit-Events eine harte Allowlist statt generischer Vorher/Nachher-Snapshots definieren:
- nur fachlich notwendige Felder loggen
- keine vollständigen Payloads sensibler Objekte loggen
- besonders sensible Werte maskieren oder vollständig auslassen

### Empfehlung

Im Dokument explizit ergänzen:

```md
Audit-Logs dürfen keine unverschlüsselten sensitiven Personen- oder Gesundheitsdaten enthalten.
Für jede Audit-Aktion wird eine explizite erlaubte Log-Payload definiert.
```

---

## 4. Die Auswirkungen der Feldverschlüsselung auf Suche, Filter, Sortierung und Auswertungen sind nicht beschrieben

### Problem

Wenn `vorname`, `nachname`, `geburtsdatum` und `pflegegrad` verschlüsselt gespeichert werden, sind diese Felder auf Datenbankebene faktisch nicht mehr sinnvoll:
- suchbar
- sortierbar
- filterbar
- aggregierbar

Das ist nicht zwingend falsch, aber es ist eine folgenreiche Architekturentscheidung. Das Dokument benennt diese Trade-offs nicht.

### Verbesserungsvorschlag

Vor Umsetzung fachlich klären:
- Müssen Admins nach Namen suchen können?
- Muss nach Pflegegrad gefiltert werden?
- Werden Geburtsdaten für Prüfungen oder Auswertungen benötigt?

Wenn ja, braucht es ein bewusstes Modell, zum Beispiel:
- zusätzliche Suchfelder
- dedizierte Normalformen
- abgeleitete nicht-sensitive Felder
- explizite Entschlüsselung nur in kontrollierten Pfaden

### Empfehlung

Mindestens einen Abschnitt "Folgen der Verschlüsselung" ergänzen, damit die Entscheidung nicht nur kryptografisch, sondern auch fachlich tragfähig ist.

---

## 5. Das Verschlüsselungsformat sollte jetzt schon versioniert werden

### Problem

Das Dokument erklärt, dass Key Rotation nicht Scope von Phase 6 ist. Das ist als Scope-Entscheidung ok. Problematisch ist aber, dass das Speicherformat keinerlei Versionsinformation vorsieht.

Ohne Versionsmarker wird jede spätere Weiterentwicklung unnötig schwer:
- Wechsel des Algorithmus
- Rotation von Keys
- Migration einzelner Datensätze
- Mischbetrieb alter und neuer Daten

### Verbesserungsvorschlag

Schon jetzt ein einfaches zukunftsfähiges Format einführen, zum Beispiel:

```text
v1.<iv_hex>.<authTag_hex>.<ciphertext_hex>
```

Oder alternativ:
- `keyVersion`
- `algorithmVersion`

als separate Metadaten.

### Empfehlung

Auch wenn Rotation nicht in Phase 6 umgesetzt wird, sollte das Datenformat dafür vorbereitet werden.

---

## 6. Compensation allein im Catch-Block reicht betrieblich nicht aus

### Problem

Die vorgeschlagene Compensation löscht den Auth-User im Fehlerfall. Wenn genau diese Löschung fehlschlägt, bleibt trotzdem ein inkonsistenter Zustand bestehen. Das Dokument sieht dafür nur `console.error(...)` vor.

Das ist für einen sicherheitsrelevanten Kernprozess zu schwach.

### Verbesserungsvorschlag

Zusätzlich zur direkten Compensation einen belastbaren Recovery-Pfad definieren:
- strukturierter Error-Log
- markierter Incident oder Reconciliation-Eintrag
- periodischer Reparaturjob für Waisen zwischen `auth.users` und `KundenProfile`

### Empfehlung

Im Dokument ergänzen:
- wie Waisen erkannt werden
- wie sie bereinigt werden
- ob der Support oder das Ops-Team dafür eine Sicht bekommt

---

## 7. Der Trigger schützt Audit-Logs nur gegen einen Teil des Bedrohungsmodells

### Problem

Ein `BEFORE UPDATE OR DELETE`-Trigger ist eine gute Baseline, aber kein vollständiger Manipulationsschutz gegen privilegierte Akteure oder administrative Fehlbedienung. Er schützt zum Beispiel nicht automatisch gegen alle Formen von:
- Schemaänderungen
- Trigger-Deaktivierung
- privilegierte Datenbankoperationen außerhalb des normalen App-Pfads

### Verbesserungsvorschlag

Das Dokument sollte das explizit als Threat-Model-Grenze benennen:
- Schutz gegen versehentliche oder application-seitige Änderungen: ja
- Schutz gegen voll privilegierte DB-Administratoren: nein

### Empfehlung

Nicht den Trigger verwerfen, sondern sauber einordnen. Der aktuelle Text formuliert den Schutz zu absolut.

---

## 8. "DSGVO" im Titel ist breiter als der tatsächliche Scope

### Problem

Das Dokument trägt "Sicherheit & DSGVO" im Titel, behandelt inhaltlich aber fast ausschließlich Sicherheitsmechanismen. Typische privacy-/governance-relevante Themen fehlen vollständig, zum Beispiel:
- Datenaufbewahrung und Löschkonzepte
- Auskunfts- und Exportfähigkeit
- Protokollierung sensibler Zugriffe
- Datenklassifikation
- Berechtigungs- und Zugriffskonzepte über Rollen hinaus

Das ist nicht zwingend falsch, aber Titel und Inhalt passen derzeit nicht sauber zusammen.

### Verbesserungsvorschlag

Eine von zwei Entscheidungen treffen:

Option A:
- Titel enger fassen, z.B. "Sicherheit & Datenschutz-Basics"

Option B:
- Scope erweitern und mindestens die unmittelbar relevanten Datenschutz-Controls ergänzen

### Empfehlung

Wenn Phase 6 bewusst technisch-sicherheitslastig bleibt, sollte der Titel präziser werden. Das verhindert falsche Erwartungen.

---

## 9. Dokument-Encoding ist erneut fehlerhaft

### Problem

Das Dokument enthält wieder Mojibake-Zeichen wie `MÃ¤rz`, `MaÃŸnahmen` und `LÃ¶sung`. Das erschwert Review und kann bei Copy, SQL und Codebeispielen zu unnötiger Unsicherheit führen.

### Verbesserungsvorschlag

Die Datei als UTF-8 normalisieren und danach noch einmal gegenlesen.

---

## Empfohlene Plan-Anpassungen vor Umsetzung

1. MFA-Zielbild eindeutig festlegen: optional oder verpflichtend.
2. Eine konkrete Migrations- und Backfill-Strategie für bestehende Klartextdaten ergänzen.
3. Audit-Log-Payloads strikt begrenzen, damit keine sensiblen Klartextdaten im Log landen.
4. Auswirkungen der Verschlüsselung auf Suche, Filter und Auswertungen explizit dokumentieren.
5. Das Chiffrat-Format jetzt schon versionierbar machen.
6. Für Compensation einen Recovery- und Reconciliation-Pfad ergänzen.
7. Den Schutzumfang des Audit-Trigger-Ansatzes realistisch beschreiben.
8. Titel und Scope in Bezug auf DSGVO präzisieren.
9. Dokument-Encoding bereinigen.

---

## Empfohlene Einstufung

### Status

Freigabefähig mit Überarbeitung.

### Begründung

Die Richtung stimmt, aber das Dokument ist noch nicht präzise genug für eine direkte Umsetzung in einem produktionsnahen System mit sensiblen Daten. Die wichtigsten Risiken sind konzeptionell lösbar, sollten aber vor Coding und Migration verbindlich entschieden werden.

---

## Technische Referenzen

- Supabase MFA TOTP Guide: https://supabase.com/docs/guides/auth/auth-mfa/totp
- Supabase JavaScript `getAuthenticatorAssuranceLevel()`: https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel
- Supabase JavaScript `admin.generateLink()`: https://supabase.com/docs/reference/javascript/auth-admin-generatelink
