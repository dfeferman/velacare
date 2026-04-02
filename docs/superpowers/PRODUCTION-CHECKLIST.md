# Velacare — Production Deployment Checklist

> Letzte Aktualisierung: 2026-04-02
> Alle Punkte müssen vor dem ersten Production-Deploy erledigt sein.

---

## 1. Supabase

### 1a. Datenbank-Migrationen einspielen

```bash
npx prisma migrate deploy
```

Folgende Migrationen müssen laufen:
- `20260401180000_encrypt_sensitive_fields` — ändert `geburtsdatum`/`pflegegrad` auf `TEXT`
- `20260402000000_audit_log_trigger` — INSERT-only Trigger für `audit_log`

Prüfen: Supabase Dashboard → Database → Migrations

### 1b. pg_cron konfigurieren

Im Supabase SQL-Editor ausführen:

```sql
ALTER DATABASE postgres SET app.base_url = 'https://deine-domain.de';
ALTER DATABASE postgres SET app.cron_secret = '<CRON_SECRET aus Vercel>';
```

Danach verifizieren:
```sql
SELECT jobname, schedule, command FROM cron.job;
-- Erwartet: Zeile "velacare-monthly-reminder" mit "0 9 1 * *"
```

### 1c. Supabase Auth — E-Mail-Einstellungen

- **Site URL** setzen: `https://deine-domain.de`
- **Redirect URLs** erlauben: `https://deine-domain.de/auth/callback`
  (Dashboard → Auth → URL Configuration)
- **Magic Links** aktivieren (sollte bereits aktiv sein)
- **E-Mail-Vorlagen** ggf. deaktivieren (wir senden eigene E-Mails via Resend — Supabase-Templates nur als Fallback)

### 1d. Supabase Auth — MFA

- Dashboard → Auth → MFA → TOTP aktivieren
- Für Admin-Accounts nach erstem Login: MFA unter `/admin/einstellungen` einrichten

### 1e. Admin-User anlegen

Nach dem Deploy den Seed-Script ausführen oder manuell in Supabase Auth einen User anlegen und in der `profiles`-Tabelle `rolle = 'admin'` setzen:

```sql
UPDATE profiles SET rolle = 'admin' WHERE email = 'admin@velacare.de';
```

---

## 2. Resend (E-Mail)

### 2a. Domain verifizieren

- Resend Dashboard → Domains → Domain hinzufügen
- DNS-Einträge (SPF, DKIM, DMARC) beim Domain-Anbieter setzen
- Warten bis Status „Verified"

### 2b. RESEND_FROM aktualisieren

In Vercel Environment Variables:
```
RESEND_FROM=Velacare <noreply@velacare.de>
```
(muss zur verifizierten Domain passen)

---

## 3. Vercel — Environment Variables

Alle diese Variablen in Vercel setzen (Dashboard → Project → Settings → Environment Variables):

| Variable | Wert | Wo finden |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Supabase → Settings → API |
| `DATABASE_URL` | Pooler-URL Port **6543** | Supabase → Settings → Database → Transaction Pooler |
| `DIRECT_URL` | Direct-URL Port 5432 | Supabase → Settings → Database → Direct connection |
| `RESEND_API_KEY` | `re_...` | Resend → API Keys |
| `RESEND_FROM` | `Velacare <noreply@velacare.de>` | — |
| `APP_URL` | `https://deine-domain.de` | — |
| `CRON_SECRET` | Starker Zufallswert | `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` |
| `FIELD_ENCRYPTION_KEY` | 64-stelliger Hex-String | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

> ⚠️ **FIELD_ENCRYPTION_KEY**: Einmal gesetzt, niemals mehr ändern — alle verschlüsselten DB-Felder werden unlesbar. Sicher extern aufbewahren (Passwort-Manager, Secret-Manager).

> ⚠️ **DATABASE_URL Port**: Unbedingt Port **6543** (Transaction Pooler) verwenden, nicht 5432 — sonst Verbindungsprobleme unter Last.

### 3b. CRON_SECRET stark setzen

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Denselben Wert auch in Supabase SQL-Editor (Schritt 1b) eintragen.

### 3c. Vercel Cron Job (optional, als Backup)

Falls pg_cron nicht zuverlässig triggert, kann Vercel selbst den Webhook aufrufen. In `vercel.json` ergänzen:

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-reminder",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

Vercel sendet dann automatisch den Request mit dem richtigen Header (via `CRON_SECRET`).

---

## 4. Sicherheit — letzte Checks

- [ ] `ADMIN_SEED_PASSWORD` in `.env.local` ist kein echter Wert (wird nicht deployed)
- [ ] `.env.local` ist in `.gitignore` ✓
- [ ] `FIELD_ENCRYPTION_KEY` extern gesichert (Passwort-Manager)
- [ ] `CRON_SECRET` in Vercel und Supabase identisch
- [ ] Supabase RLS-Policies für alle Tabellen prüfen
- [ ] Keine `console.log`-Statements mit sensiblen Daten im Code

---

## 5. Smoke-Tests nach Deploy

1. **Magic Link**: Funnel durchlaufen → E-Mail empfangen → Link klicken → `/konto` öffnet sich
2. **Verschlüsselung**: Supabase Studio → `kunden_profile` → `vorname`-Feld zeigt Chiffrat (kein Klartext)
3. **Admin-Login + MFA**: `/login` → Magic Link → `/admin` → MFA einrichten unter `/admin/einstellungen`
4. **Cron manuell testen**:
   ```bash
   curl -X POST https://deine-domain.de/api/cron/monthly-reminder \
     -H "Authorization: Bearer <CRON_SECRET>"
   ```
5. **AuditLog**: Nach Registrierung in Supabase Studio → `audit_log` → Eintrag `kunde_registriert` vorhanden
