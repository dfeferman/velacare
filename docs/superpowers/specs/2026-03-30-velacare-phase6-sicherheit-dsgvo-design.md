# Velacare Phase 6 — Sicherheit & DSGVO

> **Entstehung:** Claude Code Session
> **Datum:** 30. März 2026
> **Status:** Approved

---

## Ziel

Vier Sicherheitsmaßnahmen, die in Phase 1 bewusst zurückgestellt wurden:

1. **Application-level Encryption** — Sensitive Felder in `KundenProfile` werden verschlüsselt gespeichert
2. **AuditLog INSERT-only** — Manipulationsschutz für das Änderungsprotokoll auf DB-Ebene
3. **Compensation-Logik** — Partial-Failure in `registerKunde()` hinterlässt keinen inkonsistenten Zustand
4. **MFA für Admin-Accounts** — TOTP optional für Admin-Accounts (Enrollment und Challenge-Flow)

**Abhängigkeit:** Phase 1 (Prisma-Schema, Auth), Phase 2 (`registerKunde()`), Phase 4 (Admin-Auth, `requireAdmin()`) müssen implementiert sein.

---

## 1. Application-level Encryption

### Welche Felder

Aus `KundenProfile` — alle personenbezogenen Gesundheitsdaten:

| Feld | Aktueller Typ | Typ nach Phase 6 | Inhalt |
|---|---|---|---|
| `vorname` | `String` | `String` (encrypted) | Klartext → Chiffrat |
| `nachname` | `String` | `String` (encrypted) | Klartext → Chiffrat |
| `geburtsdatum` | `DateTime` | `String` (encrypted) | ISO-String → Chiffrat |
| `pflegegrad` | `Int` | `String` (encrypted) | Zahl als String → Chiffrat |

`geburtsdatum` und `pflegegrad` wechseln den Prisma-Typ auf `String`, da das Chiffrat kein natives Date/Int mehr ist.

### Algorithmus

**AES-256-GCM** via Node.js `crypto` (built-in, kein neues Package):
- Schlüssel: 32 Byte (256 Bit), gespeichert als 64-stelliger Hex-String in `FIELD_ENCRYPTION_KEY`
- IV: 12 Byte, zufällig pro Verschlüsselungsoperation (`crypto.randomBytes(12)`)
- Auth Tag: 16 Byte (GCM-Integritätsnachweis)
- Speicherformat: `<iv_hex>.<authTag_hex>.<ciphertext_hex>` — dots als Trennzeichen, alles Hex

```
Plaintext "Anna"
  → encrypt() → "a3f1c2...09b8.5d4e...ff12.8c9a..." (87 Zeichen)
  → DB speichert diesen String
  → decrypt() → "Anna"
```

### Schlüsselverwaltung

- `FIELD_ENCRYPTION_KEY`: 32 Byte als 64-stelliger Hex-String in Env
- Key erzeugen: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- In Vercel: als Secret (nicht als Plain Env Var) ablegen
- **Key Rotation** ist nicht Scope von Phase 6 — ein Schlüssel, kein Versionierungsschema

### Kein Prisma-Plugin

Die Verschlüsselung läuft in der DAL-Schicht (`src/lib/dal/`), nicht als Prisma-Middleware oder -Extension. Jede Funktion, die sensitive Felder liest/schreibt, ruft `encryptKundenProfile()` / `decryptKundenProfile()` auf.

### Migrationsstrategie für bestehende Daten

Der Typ-Wechsel `DateTime → String` (geburtsdatum) und `Int → String` (pflegegrad) ist in Prisma **destruktiv** — eine direkte Änderung würde bestehende Daten unlesbar machen. Die Migration erfolgt zweistufig:

1. **Schema-Migration:** Neue Hilfsspalten anlegen (`geburtsdatum_enc String?`, `pflegegrad_enc String?`), Originalspalten vorerst beibehalten.
2. **Backfill-Skript:** Alle bestehenden Datensätze lesen, Klartextwerte verschlüsseln, in neue Spalten schreiben.
3. **Deploy-Reihenfolge:** Erst Backfill abschließen und validieren, dann Code auf neue Spalten umstellen, dann Originalspalten via Migration droppen.
4. **Validierung nach Backfill:** Stichprobenweise Entschlüsselung prüfen, Zeilenanzahl alt = neu.

Rollback: Solange Originalspalten noch existieren, kann der Code auf Klartextlesen zurückgesetzt werden.

---

## 2. AuditLog INSERT-only

### Ziel

Selbst bei einer kompromittierten Anwendungsebene (z.B. SQL-Injection in einem anderen Pfad) können `audit_log`-Einträge nicht verändert oder gelöscht werden.

### Umsetzung: PostgreSQL Trigger

Kein separater DB-Nutzer (komplex mit Supabase Pooler + Prisma) — stattdessen ein Trigger auf der Tabelle selbst:

```sql
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log ist INSERT-only — UPDATE und DELETE sind nicht erlaubt';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_insert_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
```

Jeder Versuch, einen `audit_log`-Eintrag zu ändern oder zu löschen, wirft eine PostgreSQL-Exception — unabhängig davon, welcher DB-User den Befehl absetzt.

### AuditLog-Einträge schreiben

Phase 1 hat die `AuditLog`-Tabelle angelegt, aber noch niemand schreibt hinein. Phase 6 ergänzt Writes an den relevanten Stellen:

| Ereignis | Wo | Felder |
|---|---|---|
| Neuer Kunde registriert | `registerKunde()` | `aktion="kunde_registriert"`, `entityTyp="KundenProfile"`, `entityId=kundeId` |
| Box-Konfiguration geändert | DAL `updateKundenBox()` | `aktion="box_geaendert"`, nur nicht-sensitive Felder (z.B. Produkt-IDs, Mengen) — keine Personendaten |
| Admin löscht Produkt | Server Action `deleteProdukt()` | `aktion="produkt_geloescht"`, `entityId=produktId` |
| Admin ändert Produkt | Server Action `updateProdukt()` | `aktion="produkt_aktualisiert"` |

`userId` = ID des ausführenden Nutzers (aus Supabase Session). Bei System-Events (z.B. Cron) `userId = null`.

**Pflicht:** Audit-Log-Einträge dürfen keine unverschlüsselten sensitiven Personen- oder Gesundheitsdaten enthalten. Für jede Audit-Aktion wird eine explizite erlaubte Log-Payload definiert. Vollständige Objekt-Snapshots (vorher/nachher) sind verboten — nur fachlich notwendige, nicht-sensitive Felder werden geloggt.

---

## 3. Compensation-Logik in registerKunde()

### Problem

`registerKunde()` führt zwei unabhängige Write-Operationen durch:

```
1. supabase.auth.admin.generateLink() → erzeugt auth.users-Eintrag
2. prisma.kundenProfile.create() + prisma.boxKonfiguration.create() + ...
```

Wenn Schritt 2 fehlschlägt (z.B. DB-Timeout), existiert ein `auth.users`-Eintrag ohne zugehöriges `KundenProfile`. Der Kunde kann sich nie einloggen, der Datensatz ist inkonsistent.

### Lösung: Compensation im Catch-Block

```typescript
// Pseudo-Code
let authUserId: string | undefined

try {
  const { data } = await adminSupabase.auth.admin.generateLink(...)
  authUserId = data.user.id

  await prisma.$transaction([
    prisma.profile.create(...),
    prisma.kundenProfile.create(...),
    prisma.boxKonfiguration.create(...),
    prisma.einwilligung.createMany(...),
  ])

} catch (error) {
  // Compensation: Auth-User wieder löschen
  if (authUserId) {
    await adminSupabase.auth.admin.deleteUser(authUserId)
      .catch(e => console.error('Compensation fehlgeschlagen:', e))
  }
  throw error  // Ursprünglichen Fehler weitergeben
}
```

**Prisma `$transaction`** stellt sicher, dass alle DB-Writes atomar sind — entweder alle oder keiner. Der Auth-User ist der einzige Out-of-Band-Write, der manuell kompensiert werden muss.

---

## 4. MFA für Admin-Accounts

### Technologie

Supabase MFA (TOTP) via `supabase.auth.mfa.*`. Unterstützt nativ von Supabase Auth.

### Flow

**Enrollment (einmalig pro Admin):**
```
/admin/einstellungen → "2FA einrichten"
  ↓ supabase.auth.mfa.enroll({ factorType: 'totp' })
  ↓ Zeigt QR-Code (für Authenticator-App)
  ↓ Admin gibt ersten TOTP-Code ein zur Verifikation
  ↓ supabase.auth.mfa.challenge() + supabase.auth.mfa.verify()
  ↓ Factor ist jetzt enrolled und verified
```

**Login-Flow nach Enrollment:**
```
/login (E-Mail) — Phase 5 hat Passwort entfernt!
  ↓
Hinweis: Admins nutzen weiterhin E-Mail + Passwort (nicht Magic Link)
Magic Link gilt nur für Kunden
  ↓
signInWithPassword() → AAL1-Session
  ↓ requireAdmin() prüft: nextLevel === 'aal2'?
  ↓ Ja → redirect /login/mfa
/login/mfa → TOTP-Code eingeben
  ↓ supabase.auth.mfa.challenge() + verify()
  ↓ AAL2-Session
  ↓ /admin/dashboard
```

**`requireAdmin()` Erweiterung:**
```typescript
const { data: levels } = await supabase.auth.mfa.getAuthenticatorAssuranceLevels()

// Hat der Admin MFA eingerichtet und ist noch nicht auf AAL2?
if (levels?.nextLevel === 'aal2' && levels?.currentLevel !== 'aal2') {
  redirect('/login/mfa')
}
```

**Wichtig:** Phase 5 hat Passwort-Login für Kunden durch Magic Link ersetzt. Admins behalten `signInWithPassword()` — MFA setzt eine Passwortsession voraus.

### MFA ist optional bis Pflicht

Phase 6 macht MFA **optional** (Admin kann einrichten, muss aber nicht). Pflicht-MFA (Enrollment erzwungen beim ersten Admin-Login) ist spätere Phase, da sie ein komplexeres Onboarding erfordert.

---

## Scope

### In Phase 6

- `FIELD_ENCRYPTION_KEY` Env-Var + `src/lib/crypto/field-encryption.ts`
- Prisma-Schema: `geburtsdatum` → `String`, `pflegegrad` → `String` (+ Migration)
- DAL-Helpers `encryptKundenProfile()` + `decryptKundenProfile()`
- Alle betroffenen DAL-Funktionen auf Encryption umstellen
- PostgreSQL-Trigger für AuditLog INSERT-only (Migration)
- AuditLog-Writes an 4 Stellen einbauen
- Compensation-Logik in `registerKunde()`
- MFA Enrollment UI in `/admin/einstellungen`
- `/login/mfa` Route + TOTP-Verify Flow
- `requireAdmin()` um AAL2-Check erweitern

### Nicht in Phase 6

- Key Rotation (mehrere Encryption-Key-Versionen) → spätere Phase
- MFA als Pflicht erzwingen → spätere Phase
- MFA für Kunden → spätere Phase
- DSGVO-Löschungsanfragen (Recht auf Vergessen) → spätere Phase
- Penetration-Test / externer Sicherheits-Audit → vor Launch
- Separater DB-User für AuditLog-Writes → ersetzt durch Trigger-Ansatz

---

## Bekannte Grenzen (nicht in Phase 6)

Die folgenden Punkte sind bewusst ausgeklammert und sollten vor der Implementierung bekannt sein:

- **Verschlüsselung verhindert DB-seitige Suche/Filter/Sort** — `vorname`, `nachname`, `geburtsdatum`, `pflegegrad` sind nach der Verschlüsselung auf DB-Ebene nicht mehr suchbar oder sortierbar. Bevor Admin-Suche/Filter gebaut wird, muss eine explizite Lösung definiert werden (z.B. dedizierte Suchfelder oder In-Memory-Filterung nach Entschlüsselung).
- **Encryption-Format ohne Versionsmarker** — Das Format `<iv>.<authTag>.<ciphertext>` enthält keine Key-Version. Eine spätere Key Rotation oder Algorithmus-Migration wird dadurch aufwändiger. Empfehlung für Zukunft: `v1.<iv>.<authTag>.<ciphertext>`.
- **Compensation ohne strukturierten Recovery-Pfad** — Bei fehlgeschlagener Auth-User-Löschung bleibt nur `console.error`. Kein Reconciliation-Job, keine Admin-Sicht auf inkonsistente Zustände.
- **Trigger-Schutz nicht absolut** — Der INSERT-only-Trigger schützt gegen application-seitige Manipulation, nicht gegen privilegierte DB-Admins oder direkte Schemaänderungen.
- **MFA ohne Recovery-Pfad** — Kein Konzept für Backup-Codes oder Admin-Recovery bei verlorenem Authenticator-Gerät.
- **FIELD_ENCRYPTION_KEY in lokaler Entwicklung** — Die Spec beschreibt nur den Vercel-Produktionsbetrieb. Für lokale Entwicklung und CI wird ein separater (nicht-produktiver) Key benötigt; `.env.local`-Handling ist nicht spezifiziert.

---

## Neue Umgebungsvariablen

```bash
# Application-level Encryption
# Erzeugen: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
FIELD_ENCRYPTION_KEY=<64-stelliger-hex-string>
```
