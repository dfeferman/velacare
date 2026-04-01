# Architektur-Review – Phase 2 „Echter Funnel (v2 UI + Backend)“

## Executive Summary

Der Plan ist funktional gut geschnitten: Er verbindet den Funnel erstmals mit **echter Registrierung**, **persistierten Antragsdaten** und einem klaren End-to-End-Flow von Produktauswahl bis Danke-Seite. Die Scope-Abgrenzung ist sauber, und die Abhängigkeit zu Phase 1 ist korrekt benannt. Für Delivery und MVP-Fortschritt ist das stark.

Architektonisch ist Phase 2 aber **riskanter als Phase 1**, weil jetzt erstmals echte Nutzerkonten und sensible personenbezogene Daten in einem kombinierten Write-Flow verarbeitet werden. Genau dort ist der aktuelle Plan noch nicht robust genug. Die größte Schwäche ist, dass `registerKunde()` mehrere Systeme nacheinander beschreibt — **Supabase Auth**, **Admin API**, **Prisma Writes**, **Redirect** — ohne belastbares Konzept für **teilweise Fehlschläge**, **Retry-Verhalten**, **Deduplizierung**, **Replay-Schutz** und **fachliche Konsistenz**.

Mein Gesamturteil: **guter Produktplan, aber architektonisch nur eingeschränkt belastbar, solange Write-Orchestrierung und Sicherheitsmodell nicht nachgeschärft werden.**

---

## Gesamtbewertung (Ampel)

| Bereich | Bewertung | Kommentar |
|---|---|---|
| Scope & Produktfluss | 🟢 Grün | Klarer, sinnvoller End-to-End-Funnel |
| UI-/UX-Struktur | 🟢 Grün | Gute Schrittlogik, realistisch für MVP |
| Auth-Integration | 🟡 Gelb | Funktional plausibel, aber technisch heikel |
| Write-Orchestrierung | 🔴 Rot | Kein sauberes Failure-/Compensation-Modell |
| Datenmodell | 🟡 Gelb | Erweiterungen sinnvoll, aber teils fachlich zu schwach modelliert |
| Sicherheit / Datenschutz | 🔴 Rot | Sensible Daten + Service Role + fehlende Schutzdetails |
| Validierung / Datenqualität | 🔴 Rot | Noch zu implizit |
| Betriebsstabilität | 🟡 Gelb | Grundsätzlich machbar, aber ohne robuste Idempotenz riskant |

---

## 1. Scope, Phasing und Produktlogik

### Bewertung: 🟢 Grün

Die Phasenabgrenzung ist gut. Der Plan versucht nicht, Kundenportal und Admin gleichzeitig „echt“ zu machen, sondern konzentriert sich auf den Funnel als ersten vollständigen Geschäftsvorgang. Das ist architektonisch vernünftig, weil damit der erste echte „Lead-to-Account“-Prozess entsteht, ohne die restliche Plattform mitzuziehen.

Auch die Schrittlogik ist besser als in vielen frühen Funnel-Konzepten: Produktauswahl, dann Stammdaten, dann Bestätigung, dann Danke-Seite. Das ist verständlich, reduziert Sprünge und passt zum Ziel, dass der Antrag am Ende als zusammenhängender Geschäftsvorgang gespeichert wird.

**Positiv hervorzuheben:** Die Nicht-Ziele sind klar benannt. Das vermeidet Scope Drift.

---

## 2. Frontend-Architektur und State Management

### Bewertung: 🟡 Gelb

Dass `page.tsx` den Funnel-State zentral hält, ist für einen begrenzten 3-Schritt-Funnel vertretbar. Für Phase 2 ist das kein struktureller Fehler. Allerdings ist es nur solange tragfähig, wie der Funnel kompakt bleibt. Der aktuelle `Step2Data`-Block ist bereits groß und enthält sowohl **Stammdaten**, **Versorgungsdaten**, **Adresse**, **optionale Lieferadresse** als auch **Credentials**. Das ist ein Hinweis darauf, dass die State-Struktur bald fachlich überladen wird.

Ich würde hier mindestens eine interne Domänentrennung im Client-State einführen, etwa:

- `personendaten`
- `anschrift`
- `konto`
- `versorgung`
- `boxKonfiguration`

Das reduziert spätere Fehler bei Validierung, Mapping und Refactoring.

Kritischer ist etwas anderes: Der Plan beschreibt `page.tsx` als Client Component mit vollständigem Funnel-State, inklusive **Passwort**. Das ist technisch möglich, aber sicherheitlich sensibel. Ein Passwort über mehrere UI-Schritte im Client-State zu halten, ist nicht ideal. Es ist besser, das Passwort nur so kurz wie möglich im Speicher zu halten und klar zu definieren, dass es **nie geloggt**, **nie persistiert**, **nie in Analytics** und **nie in Fehlerreports** landen darf. Das muss explizit in den Architekturentscheidungen stehen.

---

## 3. Server Action `registerKunde()` und Write-Orchestrierung

### Bewertung: 🔴 Rot

Das ist der kritischste Teil des Dokuments. Der Ablauf ist logisch verständlich, aber **operational nicht robust genug**. Der Plan beschreibt diese Reihenfolge:

1. `supabase.auth.signUp()`
2. Rolle via Admin API setzen
3. `kundenProfile.upsert()`
4. `boxKonfiguration.create()`
5. `einwilligung.createMany()`
6. Redirect

Das Problem: Das ist **kein atomarer Geschäftsvorgang**. Es gibt hier mindestens drei Systemgrenzen:

- Supabase Auth
- Supabase Admin API
- Prisma/Postgres

Ein Teil kann erfolgreich sein und der nächste fehlschlagen. Dann bleibt ein Benutzerkonto eventuell bestehen, aber ohne vollständiges Kundenprofil, ohne Box, ohne Einwilligungen oder mit falscher Rolle.

### Konkrete Risikoszenarien

**Szenario A:** Signup erfolgreich, Rollenupdate schlägt fehl.  
Dann existiert ein User, aber möglicherweise ohne korrektes `app_metadata.rolle`. Das kann nachgelagert Login- oder Routing-Probleme erzeugen.

**Szenario B:** Signup und Rollenupdate erfolgreich, `kundenProfile.upsert()` erfolgreich, `boxKonfiguration.create()` schlägt fehl.  
Dann ist der Account registriert, aber der Antrag fachlich unvollständig. Aus Produktsicht hat der Nutzer „beantragt“, aus Datenbanksicht fehlt aber der Kern der Box-Konfiguration.

**Szenario C:** Button-Doppelklick / Retry / Browser-Resubmit.  
Dann drohen doppelte Box-Konfigurationen oder doppelte Einwilligungen, weil `boxKonfiguration.create()` und `einwilligung.createMany()` im Plan nicht sauber dedupliziert sind.

### Architektur-Empfehlung

Der Flow braucht ein **Orchestrierungsmodell mit Idempotenzschlüssel**. Mindestens:

- pro Funnel-Submit eine `registration_attempt_id`
- dedizierte fachliche Invariante: „pro neuem Kunden genau ein initialer Antrag“
- Datenbanktransaktion für alle Prisma-Writes
- Compensating Strategy für Fälle, in denen Auth erfolgreich war, aber Fachdaten fehlschlagen

Praktisch würde ich das so schneiden:

1. Validierung aller Inputdaten
2. Signup
3. Rollen-/Profil-Synchronisation
4. **DB-Transaktion**:
   - Kundenprofil upsert
   - Initiale Box-Konfiguration anlegen oder deduplizieren
   - Einwilligungen mit Unique-Regeln schreiben
   - optional Registrierungsstatus setzen
5. Erfolg / Fehlerbehandlung mit klarer Recovery

Wichtig: Nicht nur „idempotent gegen DB-Trigger-Race“, sondern **fachlich idempotent gegen Wiederholung des gesamten Requests**. Der Plan löst aktuell nur einen kleinen Teil des Problems.

---

## 4. Rollenmodell und Service-Role-Nutzung

### Bewertung: 🔴 Rot

Der Plan setzt `app_metadata.rolle = 'kunde'` per Admin API in einer neuen Utility mit `SUPABASE_SERVICE_ROLE_KEY`. Das ist grundsätzlich möglich, aber architektonisch heikel und sollte sparsam eingesetzt werden.

Die Kernfrage lautet: **Warum muss Phase 2 überhaupt die Rolle über die Service Role setzen?** Wenn das Rollenmodell schon in Phase 1 kritisch war, wird es hier noch kritischer, weil der Registrierungsflow jetzt aktiv mit privilegierten Rechten arbeitet.

### Probleme

- Die Service Role ist hochprivilegiert.
- Jede fehlerhafte Nutzung dieser Utility kann Sicherheitsauswirkungen haben.
- Der Plan beschreibt nur, dass sie „nie im Browser landen darf“, aber nicht, wie Missbrauch technisch verhindert wird.

### Empfehlung

Besser wäre eine klare Trennung:

- Standardmäßig: User wird registriert
- Profil-/Kundenrolle wird in der DB geführt
- JWT-Metadata wird nur dort gesetzt, wo es wirklich für Authz-Flows nötig ist

Wenn `app_metadata.rolle` zwingend benötigt wird, dann:

- Nutzung ausschließlich in Server-Only-Modulen
- harte Tests auf fehlende Client-Bundling-Leaks
- Logging/Auditing jedes privilegierten Calls
- eindeutige Festlegung, ob DB oder Metadata führend ist

Der aktuelle Plan verwendet die Service Role funktional korrekt, aber architektonisch zu „billig“. Das ist zu wenig Governance für privilegierte Identitätsmutation.

---

## 5. Datenmodell und fachliche Modellierung

### Bewertung: 🟡 Gelb

Die Erweiterung von `KundenProfile` um `versicherungsnummer`, `hausnummer`, `adresszusatz`, `versorgungssituation`, `beratung`, `lieferadresse_json` ist nachvollziehbar und fachlich plausibel.

Trotzdem sehe ich drei Modellierungsprobleme:

### a) `lieferadresse_json` als JSONB

Für Phase 2 pragmatisch okay, aber fachlich nicht ideal. Eine abweichende Lieferadresse ist strukturiert, stabil und wahrscheinlich später relevant für Versand, Prüfung, Historie oder externe Schnittstellen. Das ist eher ein Kandidat für ein **eigenes adressiertes Submodell** als für freies JSON. JSONB ist hier nur dann gut, wenn ihr sicher seid, dass diese Struktur wirklich temporär oder rein transportnah bleibt.

### b) `versorgungssituation` als String

Das ist zu schwach typisiert. Fachlich ist das ein Enum. Wenn Prisma-seitig nicht direkt als Enum modelliert wird, drohen Schreibvarianten und inkonsistente Ausprägungen. Gleiches gilt perspektivisch auch für andere Katalogfelder.

### c) `produkte` in `BoxKonfiguration` als JSONB-Snapshot

Als initialer Snapshot kann das sinnvoll sein, aber ihr müsst die Regel festlegen, ob das:

- das fachlich führende Modell ist
- nur ein abgeleiteter Snapshot ist
- später normalisiert werden soll

Ohne diese Festlegung wird `BoxKonfiguration` schnell ein Mischobjekt aus Konfiguration, Historie und UI-Payload.

### Datenbank-Empfehlungen

- Unique Constraint auf Einwilligungen, mindestens sinnvoll nach `profileId + typ + version`
- Fachliche Begrenzung initialer aktiver Boxen pro Kunde
- Check Constraints / Enums für katalogisierte Werte
- Keine unstrukturierten Strings bei Kernfeldern, wenn die Domäne klar ist

---

## 6. Validierung und Datenqualität

### Bewertung: 🔴 Rot

Der Plan nennt Felder und Ablauf, aber kaum Validierungsregeln. Für einen echten Registrierungsflow ist das zu wenig.

Gerade in Phase 2 braucht ihr eine explizite Validierungsschicht für:

- E-Mail
- Passwortstärke
- Geburtsdatum
- Pflegegrad
- PLZ/Ort
- Versicherungsnummer
- Telefonnummer
- Pflichtfelder vs. optionale Felder
- Lieferadresse nur wenn `lieferadresse_abweichend = true`

Die Regel muss serverseitig gelten, nicht nur im Client. Andernfalls schreibt ihr fehlerhafte oder unvollständige Datensätze in die DB.

Ich würde zwingend ein zentrales Input-Schema vorsehen, etwa per Zod oder vergleichbar, und daraus ableiten:

- Frontend-Validierung
- Server-Validierung
- Mapping in Prisma
- Fehlermeldungscodes

Der aktuelle Plan ist hier funktional beschrieben, aber nicht architektonisch abgesichert.

---

## 7. Datenschutz und Sicherheit

### Bewertung: 🔴 Rot

Hier liegt das größte Governance-Thema. Phase 2 verarbeitet bereits echte personenbezogene und teils hochsensible Daten:

- Name
- Geburtsdatum
- Adresse
- Telefonnummer
- Versicherungsnummer
- Pflegegrad
- Krankenkasse

Das ist nicht mehr nur „normales Signup“, sondern ein gesundheitsnaher Kontext. Dafür ist das Sicherheitskapitel im Plan zu dünn.

### Was fehlt

- Datenklassifikation: Welche Felder sind besonders schützenswert?
- Logging-Regeln: Welche Felder dürfen niemals geloggt werden?
- Redaction in Errors / Monitoring
- Verschlüsselungsstrategie für besonders sensible Felder
- Aufbewahrungs- und Löschlogik
- Rate Limiting / Abuse Protection für Signup
- Missbrauchsschutz gegen automatisierte Registrierungen

### Besonders kritisch

Die Einwilligungen werden in Step 3 mit Version `1.0` gespeichert. Das ist okay als Start, aber nur wenn klar ist:

- woher diese Version stammt
- wie Versionen verwaltet werden
- ob der Text revisionssicher referenzierbar ist

Sonst habt ihr später nur Datenbankeinträge mit „1.0“, aber keine belastbare Nachweisbarkeit, wozu genau zugestimmt wurde.

---

## 8. Fehlerbehandlung und UX-Failure-Modes

### Bewertung: 🟡 Gelb

Die dokumentierte Fehlerbehandlung „E-Mail bereits vergeben“ ist sinnvoll, aber zu schmal. Der Plan deckt im Grunde nur den offensichtlichen Happy Path plus einen Standardfehler ab.

Es fehlen definierte Reaktionen auf:

- teilweise erfolgreiche Registrierung
- Timeout nach Signup vor Redirect
- Duplicate Submit
- verlorene Session während des Flows
- E-Mail unbestätigt, aber Fachdaten schon angelegt
- erneuter Antrag mit derselben E-Mail

Gerade der letzte Punkt ist fachlich wichtig: Was ist die erwartete Semantik?

- ein bestehender, aber unbestätigter User darf fortsetzen?
- ein bestehender bestätigter User darf keinen neuen Erstregistrierungs-Funnel anlegen?
- es wird auf Login verwiesen?

Ohne solche Regeln entstehen später Supportfälle und Inkonsistenzen.

---

## 9. Danke-Seite und Registrierungsstatus

### Bewertung: 🟡 Gelb

Die Danke-Seite ist produktseitig richtig geschnitten. Kein Link ins Konto vor bestätigter E-Mail ist eine gute Entscheidung.

Architektonisch fehlt aber ein klarer **Registrierungsstatus im Domänenmodell**. Aktuell wird nur angenommen: Signup war erfolgreich, dann Redirect zur Danke-Seite. Das reicht für UI, aber nicht für Betrieb.

Ich würde einen expliziten Status modellieren, z. B.:

- `started`
- `submitted`
- `auth_created`
- `email_unconfirmed`
- `completed`
- `failed`

Damit lassen sich Recovery, Support und Reporting deutlich besser handhaben.

---

## 10. Konkrete To-Dos (priorisiert)

### 🔴 Kritisch – vor Umsetzung klären

1. **Write-Orchestrierung robust machen**  
   Kein sequenzieller Multi-System-Write ohne Recovery-Konzept.

2. **Serverseitige Validierung vollständig definieren**  
   Alle Felder mit zentralem Schema validieren.

3. **Idempotenz fachlich absichern**  
   Schutz gegen Doppelklick, Retry, Resubmit und Race Conditions.

4. **Governance für Service Role festlegen**  
   Minimaler Einsatz, sauberer Scope, Auditing.

5. **Datenschutz-/Logging-Regeln definieren**  
   Besonders für Passwort, Versicherungsnummer, Pflegegrad, Geburtsdatum.

### 🟡 Wichtig – parallel schärfen

1. `versorgungssituation` als Enum modellieren  
2. Einwilligungen revisionssicher versionieren  
3. `lieferadresse_json` fachlich hinterfragen  
4. Registrierungsstatus in der Domäne ergänzen  
5. Unique-/Check-Constraints sauber definieren

### 🟢 Gut, aber nicht blockierend

1. Client-State fachlich modularisieren  
2. Snapshot-/Normalisierungsstrategie für Box-Konfiguration festziehen  
3. Support- und Retry-Flows für unbestätigte Konten definieren

---

## Fazit

**Produktseitig:** gut.  
**Architektonisch:** brauchbar, aber noch nicht belastbar genug für echte personenbezogene Produktionsdaten.

Der Plan zeigt eine klare Delivery-Absicht und einen sinnvollen Funnel-Zuschnitt. Was noch fehlt, ist die zweite Schicht, die gute Architektur von einem nur funktionierenden Flow unterscheidet: **transaktionsnahe Orchestrierung, belastbare Idempotenz, saubere Validierung, restriktive Service-Role-Nutzung und explizite Datenschutzregeln**.
