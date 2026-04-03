# Security Review: Phase 6 — Sicherheit & DSGVO

> **Erstellt:** 2026-04-04
> **Basis:** `docs/superpowers/plans/2026-03-30-phase6-sicherheit-dsgvo.md`
> **Status:** Offen — Lücken gegenüber dem ursprünglichen Plan

---

## Was der Plan gut löst

- AES-256-GCM mit random IV (korrekt, keine IV-Wiederverwendung)
- Compensation-Logik in `registerKunde()` ist implementiert und funktional
- AAL2-Check in `requireAdmin()` ist korrekt (inkl. Singular-Methode)
- INSERT-only Trigger für AuditLog ist solide

---

## Lücken & Verbesserungsvorschläge (priorisiert)

---

### P1 — Kritisch (Datenschutz / DSGVO)

**1. `unterschrift` wird unverschlüsselt gespeichert**
Der Plan nennt 5 verschlüsselte Felder, aber `unterschrift` (base64-PNG der Handunterschrift) fehlt. Das ist biometrisch-ähnliche PII und besonders schutzwürdig nach Art. 9 DSGVO. In `src/app/actions/register.ts:101/119` landet der Wert im Klartext in der DB.

**2. `strasse`, `hausnummer`, `plz`, `ort`, `telefon` nicht verschlüsselt**
Diese Adress- und Kontaktfelder sind personenbezogene Daten nach Art. 4 DSGVO, werden aber im Klartext gespeichert (`register.ts:93–97`). Der Plan erwähnt sie nicht.

**3. `lieferadresse_json` nicht verschlüsselt**
Die abweichende Lieferadresse (`register.ts:98`) wird als JSON-Blob im Klartext gespeichert, obwohl sie ebenfalls Adressdaten enthält.

**4. Keine Key-Rotation-Strategie**
Die verschlüsselten Felder tragen keine Schlüsselversion. Bei Key-Kompromittierung gibt es keinen Migrationspfad — alle Daten müssten blind mit dem alten Key entschlüsselt und neu verschlüsselt werden. Der Plan schweigt dazu komplett.

> Empfehlung: Format `v1.<iv>.<tag>.<data>` einführen, damit künftige Key-Rotation inkrementell möglich ist.

**5. DSGVO Art. 17 (Recht auf Löschung) fehlt**
Der Plan heißt "Sicherheit & DSGVO", aber kein einziger Task adressiert das Recht auf Datenlöschung/-anonymisierung. Mit dem INSERT-only Trigger kann man AuditLog-Einträge nie löschen — das kollidiert direkt mit DSGVO-Löschanfragen.

---

### P2 — Hoch (Sicherheit / Korrektheit)

**6. MFA-Enrollment ist optional, nicht erzwungen**
`requireAdmin()` prüft nur, ob `nextLevel === 'aal2'` — das ist nur der Fall wenn MFA bereits *enrolled* ist. Neue Admins, die MFA nie einrichten, können unbegrenzt ohne 2FA auf `/admin` zugreifen. Der Plan definiert keine Policy, die Enrollment verpflichtend macht.

**7. `useFormState` statt `useActionState` in Task 8 / Step 3**
Der Plan importiert explizit `useFormState from 'react-dom'` in `mfa/page.tsx`. CLAUDE.md sagt klar: *"Use `useActionState` (not `useFormState` — that's Next.js 14/React 18)"*. Das erzeugt in Next.js 15 einen Laufzeitfehler.

**8. Kein Rate Limiting auf MFA-Endpoint**
`/login/mfa/actions.ts` hat kein Rate Limiting. Ein Angreifer mit gültiger Admin-Session (AAL1) könnte TOTP-Codes systematisch ausprobieren. Keine App-seitige Absicherung vorgesehen.

**9. PII in AuditLog-JSONB (`alt_wert` / `neu_wert`)**
Wenn Box-Änderungen oder Profil-Updates mit Vorher/Nachher-Daten geloggt werden, landen die entschlüsselten PII-Felder im Klartext im AuditLog. Der Plan erwähnt keine Sanitisierung der geloggten Werte.

**10. Email-Adresse im Error-Log geleakt**
`register.ts:173`: `console.error('...', { email: email, ... })` — die E-Mail-Adresse wird bei Fehlern im Server-Log protokolliert. In Produktionsumgebungen mit zentralem Log-Aggregation (Vercel Logs, Datadog) ist das ein PII-Leak.

---

### P3 — Mittel (Design-Lücken)

**11. Keine RLS-Policies für AuditLog**
Der Plan legt einen Trigger an, aber keine Row Level Security. Ohne RLS kann jeder authentifizierte Supabase-User potentiell alle Audit-Einträge lesen. Fehlt im Plan:
```sql
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Admin-only SELECT Policy
```

**12. MFA Backup-Codes / Recovery-Pfad fehlt**
Wenn ein Admin sein Authenticator-Gerät verliert, gibt es keinen definierten Recovery-Pfad. Supabase unterstützt Backup-Codes — der Plan erwähnt das nicht. In der Praxis: Admin ist locked out.

**13. Smoke-Test in Task 1 funktioniert nicht**
Der Plan selbst gibt das zu: Step 4 schlägt vor, `require('./field-encryption.ts')` im REPL aufzurufen, stellt dann fest, dass das wegen TypeScript nicht geht. Es bleibt nur `npm run build` — kein funktionaler Roundtrip-Test (encrypt → decrypt → verify equality).

**14. Keine Datenmigration für bestehende (unverschlüsselte) Rows**
Task 2 ändert die Spaltentypen, aber wenn es bereits Testdaten in der Dev-DB gibt, stehen nach der Migration Klartextwerte in String-Spalten, die der `decrypt()`-Helper dann zum Crash bringt. Kein Migrationsscript vorgesehen.

---

### P4 — Niedrig / Nice-to-have

**15. Security Headers fehlen**
Kein Task in Phase 6 fügt `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` oder `Content-Security-Policy` in `next.config.js` ein — Standard für Healthcare-Anwendungen.

**16. DSGVO Art. 20 (Datenportabilität) nicht adressiert**
Kein Export-Endpunkt für Kundendaten. Nicht zwingend für Launch, aber sollte im Backlog stehen.

**17. `FIELD_ENCRYPTION_KEY` nur als env var, kein Secrets Manager**
Für Produktion wird der Key als Vercel-Env-Var gespeichert — ohne HSM oder Secrets Manager. Die Production-Checklist erwähnt das, aber Phase 6 definiert keinen Prozess.

---

## Zusammenfassung

| Prio | Anzahl | Kernthemen |
|------|--------|------------|
| P1 | 5 | Unverschlüsselte PII (Adresse, Unterschrift), Key-Rotation, DSGVO Löschrecht |
| P2 | 5 | MFA nicht erzwungen, Next.js 15 Bug im Plan, Rate Limiting, PII in Logs |
| P3 | 4 | AuditLog RLS, MFA Recovery, fehlender Roundtrip-Test, Datenmigration |
| P4 | 3 | Security Headers, Art. 20, Secrets Manager |

**Größter blinder Fleck:** Der Plan behandelt Verschlüsselung als abgeschlossen, sobald 5 Felder in `encryptKundenProfile()` stehen — aber `unterschrift`, alle Adressfelder und `lieferadresse_json` sind mindestens genauso schutzbedürftig und liegen im Klartext in der DB.
