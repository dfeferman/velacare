# Phase 6 Sicherheit & DSGVO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Application-level Encryption für sensitive KundenProfile-Felder; AuditLog INSERT-only via PostgreSQL-Trigger; Compensation-Logik in `registerKunde()`; MFA (TOTP) für Admin-Accounts.

**Architecture:** Verschlüsselung läuft in der DAL-Schicht — kein Prisma-Plugin, kein Middleware-Magic. `encryptKundenProfile()` / `decryptKundenProfile()` sind reine Hilfsfunktionen. AuditLog-Schutz via DB-Trigger (kein separater DB-User). MFA via Supabase `auth.mfa.*` API — Admins behalten Passwort-Login, Kunden nutzen Magic Link.

**Tech Stack:** Next.js 14 App Router · Node.js `crypto` (built-in) · Prisma 5 · `@supabase/ssr` · TypeScript

**Abhängigkeit:** Phase 1 (Prisma-Schema, `createClient`, `createAdminClient`), Phase 2 (`registerKunde()`), Phase 4 (`requireAdmin()`, Admin Server Actions) müssen implementiert sein.

---

## File Structure

```
src/
  lib/
    crypto/
      field-encryption.ts           NEW — encrypt() / decrypt() / encryptKundenProfile() / decryptKundenProfile()
    dal/
      kunden.ts                     MODIFY — alle Reads/Writes: sensitive Felder ver-/entschlüsseln
      admin.ts                      MODIFY — getAdminKundeDetail() entschlüsseln
    auth/
      require-admin.ts              MODIFY — AAL2-Check für MFA ergänzen
  app/
    actions/
      auth.ts                       MODIFY — registerKunde(): Compensation + AuditLog-Write
      admin.ts                      MODIFY — Produkt-Actions + AuditLog-Writes
    login/
      mfa/
        page.tsx                    NEW — TOTP-Eingabe-Seite
        actions.ts                  NEW — MFA Challenge + Verify Server Actions
    admin/
      einstellungen/
        page.tsx                    MODIFY — MFA-Enrollment-UI ergänzen
        mfa-enrollment.tsx          NEW — Client Component: QR-Code + Verify-Schritt

prisma/
  schema.prisma                     MODIFY — geburtsdatum: String, pflegegrad: String
  migrations/
    YYYYMMDD_encrypt_fields/
      migration.sql                 AUTO — prisma migrate dev
    YYYYMMDD_audit_log_trigger/
      migration.sql                 NEW — INSERT-only Trigger

.env.local.example                  MODIFY — FIELD_ENCRYPTION_KEY ergänzen
```

---

## Task 1: Field-Encryption-Helper

**Files:**
- Create: `src/lib/crypto/field-encryption.ts`
- Modify: `.env.local.example`
- Modify: `.env.local`

Die Grundlage für alle anderen Tasks. Kein neues Package — ausschließlich Node.js `crypto` (built-in).

- [ ] **Step 1: `FIELD_ENCRYPTION_KEY` in `.env.local.example` ergänzen**

```bash
# Application-level Encryption (AES-256-GCM)
# Erzeugen: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
FIELD_ENCRYPTION_KEY=<64-stelliger-hex-string>
```

- [ ] **Step 2: Key für Dev generieren und in `.env.local` setzen**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Den Output in `.env.local` als `FIELD_ENCRYPTION_KEY=<output>` eintragen.

- [ ] **Step 3: `field-encryption.ts` anlegen**

```typescript
// src/lib/crypto/field-encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12    // Byte (96 Bit — GCM-Standard)
const TAG_LENGTH = 16   // Byte

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('FIELD_ENCRYPTION_KEY muss ein 64-stelliger Hex-String sein')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Verschlüsselt einen Plaintext-String.
 * Rückgabe: "<iv_hex>.<authTag_hex>.<ciphertext_hex>"
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    ciphertext.toString('hex'),
  ].join('.')
}

/**
 * Entschlüsselt einen via encrypt() erzeugten String.
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split('.')
  if (parts.length !== 3) {
    throw new Error('Ungültiges Chiffrat-Format')
  }

  const [ivHex, authTagHex, dataHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

// ─── KundenProfile-spezifische Helpers ──────────────────────────────────────

interface SensitiveKundenFields {
  vorname: string
  nachname: string
  geburtsdatum: string   // ISO-String (nach Typ-Änderung in Phase 6)
  pflegegrad: string     // Zahl als String (nach Typ-Änderung in Phase 6)
}

type EncryptedKundenFields = SensitiveKundenFields  // gleiche Shape, andere Inhalte

/**
 * Verschlüsselt alle 4 sensiblen Felder eines KundenProfile-Objekts.
 * Gibt ein neues Objekt zurück (Immutability).
 */
export function encryptKundenProfile(
  fields: SensitiveKundenFields
): EncryptedKundenFields {
  return {
    vorname: encrypt(fields.vorname),
    nachname: encrypt(fields.nachname),
    geburtsdatum: encrypt(fields.geburtsdatum),
    pflegegrad: encrypt(fields.pflegegrad),
  }
}

/**
 * Entschlüsselt alle 4 sensiblen Felder.
 * Gibt ein neues Objekt zurück (Immutability).
 */
export function decryptKundenProfile(
  fields: EncryptedKundenFields
): SensitiveKundenFields {
  return {
    vorname: decrypt(fields.vorname),
    nachname: decrypt(fields.nachname),
    geburtsdatum: decrypt(fields.geburtsdatum),
    pflegegrad: decrypt(fields.pflegegrad),
  }
}
```

- [ ] **Step 4: Smoke-Test im Node REPL**

```bash
node -e "
const { encrypt, decrypt } = require('./src/lib/crypto/field-encryption.ts')
// Erwartet Fehler, da TypeScript. Stattdessen Build nutzen:
"
```

Da TypeScript nicht direkt im Node REPL läuft, Build-Check verwenden:

```bash
npm run build
```

Erwartet: keine TypeScript-Fehler.

- [ ] **Step 5: Commit**

```bash
git add src/lib/crypto/field-encryption.ts .env.local.example
git commit -m "feat: add AES-256-GCM field encryption helper"
```

---

## Task 2: Prisma-Schema — Typ-Änderung für verschlüsselte Felder

**Files:**
- Modify: `prisma/schema.prisma`
- Auto-generate: `prisma/migrations/...`

`geburtsdatum` und `pflegegrad` wechseln von `DateTime`/`Int` zu `String`, da die Chiffrate Strings sind. `vorname` und `nachname` bleiben `String` (kein Typ-Wechsel nötig).

- [ ] **Step 1: Schema ändern**

In `prisma/schema.prisma`, Modell `KundenProfile`:

```prisma
model KundenProfile {
  // ...vorher:
  // geburtsdatum  DateTime
  // pflegegrad    Int

  // nachher:
  geburtsdatum  String   // AES-256-GCM Chiffrat (war DateTime)
  pflegegrad    String   // AES-256-GCM Chiffrat (war Int)

  // vorname und nachname bleiben String — nur der Inhalt ändert sich
  // ...
}
```

- [ ] **Step 2: Migration generieren**

```bash
npx prisma migrate dev --name encrypt_sensitive_fields
```

Prisma erkennt die Typ-Änderungen und generiert die entsprechenden `ALTER TABLE`-Statements.

Erwartet: neue Migration, Prisma Client regeneriert.

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

Hinweis: Nach diesem Schritt werden alle DAL-Funktionen, die `geburtsdatum` als `Date` oder `pflegegrad` als `number` behandeln, TypeScript-Fehler zeigen. Das ist erwartet — sie werden in Task 3 korrigiert.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: change geburtsdatum/pflegegrad to String for encryption"
```

---

## Task 3: DAL — Encryption auf alle Lese- und Schreibpfade anwenden

**Files:**
- Modify: `src/lib/dal/kunden.ts`
- Modify: `src/lib/dal/admin.ts`
- Modify: `src/app/actions/auth.ts` (registerKunde Writes)

Jede Funktion, die sensitive Felder schreibt, ruft `encryptKundenProfile()` auf. Jede Funktion, die sensitive Felder liest und weitergibt, ruft `decryptKundenProfile()` auf.

- [ ] **Step 1: Import in betroffenen DAL-Dateien ergänzen**

In `src/lib/dal/kunden.ts` und `src/lib/dal/admin.ts`:

```typescript
import {
  encryptKundenProfile,
  decryptKundenProfile,
} from '@/lib/crypto/field-encryption'
```

- [ ] **Step 2: Writes verschlüsseln**

Überall, wo `vorname`, `nachname`, `geburtsdatum`, `pflegegrad` in einen Prisma `create()` oder `update()` Write eingehen:

```typescript
// Vorher:
await prisma.kundenProfile.create({
  data: {
    vorname: formData.vorname,
    nachname: formData.nachname,
    geburtsdatum: new Date(formData.geburtsdatum),
    pflegegrad: formData.pflegegrad,
    // ...
  },
})

// Nachher:
const encrypted = encryptKundenProfile({
  vorname: formData.vorname,
  nachname: formData.nachname,
  geburtsdatum: formData.geburtsdatum,  // ISO-String
  pflegegrad: String(formData.pflegegrad),
})

await prisma.kundenProfile.create({
  data: {
    ...encrypted,
    // ...andere Felder
  },
})
```

- [ ] **Step 3: Reads entschlüsseln**

Überall, wo ein `KundenProfile`-Objekt aus Prisma gelesen und an die UI weitergegeben wird:

```typescript
// Vorher:
const profil = await prisma.kundenProfile.findUniqueOrThrow({ where: { id } })
return profil

// Nachher:
const raw = await prisma.kundenProfile.findUniqueOrThrow({ where: { id } })
return {
  ...raw,
  ...decryptKundenProfile({
    vorname: raw.vorname,
    nachname: raw.nachname,
    geburtsdatum: raw.geburtsdatum,
    pflegegrad: raw.pflegegrad,
  }),
  // pflegegrad zurück zu number konvertieren (UI erwartet number):
  pflegegrad: Number(decryptKundenProfile({ ...raw }).pflegegrad),
}
```

**Hinweis:** `pflegegrad` wird intern als verschlüsselter String gespeichert, aber beim Lesen wieder zu `number` konvertiert — die UI-Komponenten erwarten weiterhin `number`. Das geschieht ausschließlich in der DAL-Schicht, nicht in UI-Komponenten.

- [ ] **Step 4: Alle betroffenen Dateien identifizieren**

```bash
grep -rn "geburtsdatum\|pflegegrad\|vorname\|nachname" src/lib/dal/ src/app/actions/
```

Jeden Treffer prüfen: liest oder schreibt diese Zeile sensitive Felder? Falls ja → encrypt/decrypt ergänzen.

- [ ] **Step 5: Build prüfen — kein TypeScript-Fehler**

```bash
npm run build
```

Erwartet: alle Typ-Fehler aus Task 2 behoben.

- [ ] **Step 6: Manuell testen**

Dev-Server starten. Funnel durchlaufen → neuen Kunden registrieren. Dann:
- In Supabase Studio: `KundenProfile`-Tabelle öffnen → `vorname`-Feld sollte ein Chiffrat zeigen (kein Klartext)
- Im Kundenportal (`/konto/dashboard`): Name und Pflegegrad sollten korrekt angezeigt werden (entschlüsselt)

- [ ] **Step 7: Commit**

```bash
git add src/lib/dal/ src/app/actions/auth.ts
git commit -m "feat: encrypt/decrypt sensitive KundenProfile fields in DAL"
```

---

## Task 4: AuditLog INSERT-only Trigger

**Files:**
- Create: `prisma/migrations/YYYYMMDD_audit_log_trigger/migration.sql`

- [ ] **Step 1: Migration-Datei anlegen**

Ordner: `prisma/migrations/<datum>_audit_log_trigger/`
Datei: `migration.sql`

```sql
-- Funktion: wirft Exception bei UPDATE oder DELETE auf audit_log
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'audit_log ist INSERT-only — % auf Zeile % ist nicht erlaubt',
    TG_OP, OLD.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: greift vor jedem UPDATE oder DELETE
CREATE TRIGGER audit_log_insert_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
```

- [ ] **Step 2: Migration einspielen**

```bash
npx prisma migrate deploy
```

- [ ] **Step 3: Trigger manuell verifizieren**

Im Supabase SQL-Editor:

```sql
-- Einen Test-Eintrag anlegen
INSERT INTO audit_log (id, aktion, entity_typ, created_at)
VALUES ('test-id-1', 'test', 'test', NOW());

-- Versuch zu updaten → muss Exception werfen
UPDATE audit_log SET aktion = 'geaendert' WHERE id = 'test-id-1';
-- Erwartete Ausgabe: ERROR: audit_log ist INSERT-only — ...

-- Versuch zu löschen → muss Exception werfen
DELETE FROM audit_log WHERE id = 'test-id-1';
-- Erwartete Ausgabe: ERROR: audit_log ist INSERT-only — ...

-- Cleanup
DELETE FROM audit_log WHERE id = 'test-id-1';
-- Hinweis: Da DELETE fehlschlägt, Cleanup via:
-- Trigger temporär deaktivieren ist für den Test ok (ALTER TABLE audit_log DISABLE TRIGGER ...)
-- In Production: Test-Einträge können nicht gelöscht werden — das ist korrekt.
```

- [ ] **Step 4: Commit**

```bash
git add prisma/migrations/
git commit -m "feat: add INSERT-only trigger for audit_log table"
```

---

## Task 5: AuditLog-Writes einbauen

**Files:**
- Modify: `src/app/actions/auth.ts` (`registerKunde()`)
- Modify: `src/app/actions/admin.ts` (Produkt-Actions)
- Modify: `src/lib/dal/kunden.ts` (`updateKundenBox()`)

AuditLog-Writes laufen über `prisma.auditLog.create()`. Sie sind als Best-Effort konzipiert: ein Fehler beim AuditLog-Write bricht die Hauptoperation nicht ab.

- [ ] **Step 1: AuditLog-Helper anlegen**

```typescript
// src/lib/dal/audit.ts
import prisma from '@/lib/prisma'

interface AuditEntry {
  aktion: string
  entityTyp: string
  entityId?: string
  userId?: string        // null bei System-Events
  vorher?: object        // JSONB — Zustand vor der Änderung
  nachher?: object       // JSONB — Zustand nach der Änderung
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      aktion: entry.aktion,
      entityTyp: entry.entityTyp,
      entityId: entry.entityId ?? null,
      userId: entry.userId ?? null,
      vorher: entry.vorher ?? undefined,
      nachher: entry.nachher ?? undefined,
    },
  })
}
```

- [ ] **Step 2: AuditLog in `registerKunde()` schreiben**

Nach allen Prisma-Writes, vor `sendEmail()`:

```typescript
try {
  await writeAuditLog({
    aktion: 'kunde_registriert',
    entityTyp: 'KundenProfile',
    entityId: neuesKundeProfil.id,
    userId: neuerAuthUser.id,
  })
} catch (e) {
  console.error('AuditLog-Write fehlgeschlagen (registerKunde):', e)
}
```

Import ergänzen: `import { writeAuditLog } from '@/lib/dal/audit'`

- [ ] **Step 3: AuditLog in Admin-Produkt-Actions schreiben**

In `src/app/actions/admin.ts`, nach jedem erfolgreichen Produkt-Write:

```typescript
// deleteProdukt()
await writeAuditLog({
  aktion: 'produkt_geloescht',
  entityTyp: 'Produkt',
  entityId: produktId,
  userId: adminUser.id,
  vorher: geloeschtesProdukт,
})

// updateProdukt()
await writeAuditLog({
  aktion: 'produkt_aktualisiert',
  entityTyp: 'Produkt',
  entityId: produktId,
  userId: adminUser.id,
  vorher: altesProdukt,
  nachher: aktualisiertesDaten,
})
```

- [ ] **Step 4: AuditLog in `updateKundenBox()` schreiben**

In `src/lib/dal/kunden.ts`:

```typescript
await writeAuditLog({
  aktion: 'box_geaendert',
  entityTyp: 'BoxKonfiguration',
  entityId: boxId,
  userId,
  vorher: alteKonfiguration,
  nachher: neueKonfiguration,
})
```

- [ ] **Step 5: Build prüfen**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/dal/audit.ts src/app/actions/ src/lib/dal/kunden.ts
git commit -m "feat: write AuditLog entries for register, box-update, product CRUD"
```

---

## Task 6: Compensation-Logik in registerKunde()

**Files:**
- Modify: `src/app/actions/auth.ts`

Stellt sicher, dass bei einem Prisma-Fehler nach erfolgreichem `generateLink()` der Auth-User wieder gelöscht wird.

- [ ] **Step 1: Auth-Variable vor dem Try-Block deklarieren**

```typescript
let authUserId: string | undefined

try {
  // generateLink() — erzeugt auth.users-Eintrag
  const { data: linkData, error: linkError } =
    await adminSupabase.auth.admin.generateLink({ type: 'magiclink', email: formData.email })

  if (linkError || !linkData.user?.id || !linkData.properties?.hashed_token) {
    return { error: 'Konto konnte nicht erstellt werden.' }
  }

  authUserId = linkData.user.id  // Merken für Compensation

  // Alle Prisma-Writes atomar
  await prisma.$transaction([
    prisma.profile.create({ data: { id: authUserId, /* ... */ } }),
    prisma.kundenProfile.create({ data: { /* ... */ } }),
    prisma.boxKonfiguration.create({ data: { /* ... */ } }),
    prisma.einwilligung.createMany({ data: [ /* ... */ ] }),
  ])

  // Magic Link URL
  const magicLinkUrl = `${process.env.APP_URL}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`

  // E-Mail senden (non-blocking)
  try {
    await sendEmail({ /* ... */ })
  } catch (emailError) {
    console.error('E-Mail-Versand fehlgeschlagen:', emailError)
  }

  // AuditLog (non-blocking)
  try {
    await writeAuditLog({ /* ... */ })
  } catch (auditError) {
    console.error('AuditLog-Write fehlgeschlagen:', auditError)
  }

} catch (error) {
  // Compensation: Auth-User löschen falls DB-Write fehlgeschlagen
  if (authUserId) {
    await adminSupabase.auth.admin.deleteUser(authUserId).catch((compError) => {
      console.error('Compensation fehlgeschlagen — Auth-User konnte nicht gelöscht werden:', {
        authUserId,
        error: compError,
      })
    })
  }

  console.error('registerKunde() fehlgeschlagen:', error)
  return { error: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.' }
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

- [ ] **Step 3: Compensation manuell testen**

Für einen manuellen Test: In `prisma.$transaction()` vor dem ersten Write bewusst einen Fehler werfen (`throw new Error('Test')`). Dann Funnel durchlaufen. Prüfen:
- In Supabase Auth → kein neuer User angelegt (Compensation hat gelöscht)
- In Prisma DB → keine neuen Einträge

Anschließend den Test-Throw wieder entfernen.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/auth.ts
git commit -m "feat: add compensation logic to registerKunde() for partial failure"
```

---

## Task 7: MFA Enrollment UI

**Files:**
- Create: `src/app/admin/einstellungen/mfa-enrollment.tsx`
- Modify: `src/app/admin/einstellungen/page.tsx`

- [ ] **Step 1: MFA Enrollment Client Component anlegen**

```tsx
// src/app/admin/einstellungen/mfa-enrollment.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EnrollStep = 'idle' | 'qr' | 'verify' | 'done' | 'error'

export function MfaEnrollment() {
  const [step, setStep] = useState<EnrollStep>('idle')
  const [qrCode, setQrCode] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [challengeId, setChallengeId] = useState<string>('')
  const [totpCode, setTotpCode] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const supabase = createClient()

  async function startEnrollment() {
    setErrorMsg('')
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) {
      setErrorMsg('Enrollment fehlgeschlagen: ' + error?.message)
      setStep('error')
      return
    }
    setQrCode(data.totp.qr_code)
    setFactorId(data.id)
    setStep('qr')
  }

  async function startChallenge() {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId })
    if (error || !data) {
      setErrorMsg('Challenge fehlgeschlagen: ' + error?.message)
      return
    }
    setChallengeId(data.id)
    setStep('verify')
  }

  async function verifyCode() {
    setErrorMsg('')
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: totpCode,
    })
    if (error) {
      setErrorMsg('Code ungültig: ' + error.message)
      return
    }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="rounded-lg bg-sage/10 border border-sage/20 p-4">
        <p className="text-sm font-medium text-sage">
          2-Faktor-Authentifizierung ist jetzt aktiv.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-dark">2-Faktor-Authentifizierung</h3>
        <p className="text-sm text-warm-gray mt-1">
          Schütze deinen Admin-Account mit einem TOTP-Authenticator (z.B. Google Authenticator).
        </p>
      </div>

      {step === 'idle' && (
        <button
          onClick={startEnrollment}
          className="px-4 py-2 bg-terra text-white rounded-md text-sm font-medium"
        >
          2FA einrichten
        </button>
      )}

      {step === 'qr' && (
        <div className="space-y-4">
          <p className="text-sm text-dark">
            Scanne diesen QR-Code mit deiner Authenticator-App:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="TOTP QR-Code" className="w-48 h-48" />
          <button
            onClick={startChallenge}
            className="px-4 py-2 bg-terra text-white rounded-md text-sm font-medium"
          >
            Weiter → Code eingeben
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-3">
          <p className="text-sm text-dark">Gib den 6-stelligen Code aus deiner App ein:</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            className="w-32 px-3 py-2 border border-warm-gray/30 rounded-md text-center text-lg tracking-widest"
            placeholder="000000"
          />
          <button
            onClick={verifyCode}
            className="block px-4 py-2 bg-terra text-white rounded-md text-sm font-medium"
          >
            Bestätigen
          </button>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        </div>
      )}

      {step === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: MFA-Sektion in `/admin/einstellungen/page.tsx` einbauen**

Die `MfaEnrollment`-Komponente in den Einstellungen rendern. Beispiel:

```tsx
import { MfaEnrollment } from './mfa-enrollment'

// In der Page-Komponente, nach bestehenden Sektionen:
<section className="mt-8 border-t border-warm-gray/10 pt-8">
  <MfaEnrollment />
</section>
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

- [ ] **Step 4: Enrollment manuell testen**

1. Als Admin einloggen → `/admin/einstellungen`
2. "2FA einrichten" klicken → QR-Code erscheint
3. QR-Code mit Authenticator-App scannen
4. "Weiter" klicken → Code eingeben → Bestätigen
5. Erfolgsmeldung erscheint
6. In Supabase Dashboard → Authentication → MFA: Factor für den User sichtbar

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/einstellungen/
git commit -m "feat: add MFA enrollment UI for admin accounts"
```

---

## Task 8: MFA Login-Flow + requireAdmin() AAL2-Check

**Files:**
- Create: `src/app/login/mfa/page.tsx`
- Create: `src/app/login/mfa/actions.ts`
- Modify: `src/lib/auth/require-admin.ts`

### 8a: requireAdmin() um AAL2-Check erweitern

- [ ] **Step 1: `require-admin.ts` aktualisieren**

```typescript
// src/lib/auth/require-admin.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/')

  // MFA-Check: Hat der Admin MFA eingerichtet und ist noch auf AAL1?
  const { data: levels } = await supabase.auth.mfa.getAuthenticatorAssuranceLevels()
  if (levels?.nextLevel === 'aal2' && levels?.currentLevel !== 'aal2') {
    redirect('/login/mfa')
  }

  return user
}
```

### 8b: /login/mfa Seite + Server Action

- [ ] **Step 2: MFA Server Action anlegen**

```typescript
// src/app/login/mfa/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyMfa(formData: FormData) {
  const code = formData.get('code') as string
  const supabase = createClient()

  // Alle enrolled Factors laden
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totpFactor = factors?.totp?.[0]

  if (!totpFactor) {
    redirect('/admin')  // Kein MFA eingerichtet — direkt weiter
  }

  // Challenge erzeugen
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: totpFactor.id })

  if (challengeError || !challenge) {
    return { error: 'Challenge fehlgeschlagen. Bitte erneut versuchen.' }
  }

  // Code verifizieren
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challenge.id,
    code,
  })

  if (verifyError) {
    return { error: 'Ungültiger Code. Bitte prüfe deine Authenticator-App.' }
  }

  redirect('/admin')
}
```

- [ ] **Step 3: /login/mfa Seite anlegen**

```tsx
// src/app/login/mfa/page.tsx
'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { verifyMfa } from './actions'

export default function MfaPage() {
  const [state, action] = useFormState(verifyMfa, undefined)

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-warm-white rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-serif text-2xl text-dark mb-2">2-Faktor-Authentifizierung</h1>
        <p className="text-sm text-warm-gray mb-6">
          Gib den aktuellen Code aus deiner Authenticator-App ein.
        </p>

        <form action={action} className="space-y-4">
          <input
            type="text"
            name="code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            required
            placeholder="000000"
            className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg text-center text-2xl tracking-widest font-mono"
          />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-terra text-white rounded-lg font-medium"
          >
            Bestätigen
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Build prüfen**

```bash
npm run build
```

- [ ] **Step 5: MFA Login-Flow manuell testen**

Voraussetzung: Task 7 abgeschlossen, MFA enrolled.

1. Admin ausloggen
2. Neu einloggen → nach Passwort-Eingabe → Redirect auf `/login/mfa`
3. TOTP-Code eingeben → Redirect auf `/admin/dashboard`
4. Ohne MFA enrolled: Login → direkt `/admin` (kein MFA-Redirect)

- [ ] **Step 6: Commit**

```bash
git add src/app/login/mfa/ src/lib/auth/require-admin.ts
git commit -m "feat: MFA login flow and AAL2 check in requireAdmin()"
```

---

## Task 9: ROADMAP aktualisieren

**Files:**
- Modify: `docs/superpowers/ROADMAP.md`

- [ ] **Step 1: Phase 6 auf ✅ setzen**

```markdown
| 6     | Sicherheit & DSGVO (Encryption, AuditLog, MFA)  | ✅    | ✅    | ✅    |
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/ROADMAP.md
git commit -m "docs: update ROADMAP — Phase 6 fertig"
```
