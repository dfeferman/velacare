# Velacare Phase 5 — E-Mail & Jobs (Resend, pg_cron)

> **Entstehung:** Claude Code Session
> **Datum:** 30. März 2026
> **Status:** Approved

---

## Ziel

Transaktionale E-Mails via Resend + React Email einführen, Magic Link / OTP als Ersatz für das Passwort-Feld im Bewerbungs-Funnel umsetzen, und eine monatliche Erinnerungs-E-Mail via pg_cron automatisch versenden. Velacare kommuniziert nach Phase 5 aktiv mit Kunden statt passiv auf manuelle Interaktion zu warten.

**Abhängigkeit:** Phase 1 (Supabase Auth, Prisma, Middleware) und Phase 2 (Funnel + KundenProfile in DB) müssen abgeschlossen sein.

---

## Neue Dependencies

| Package | Zweck |
|---|---|
| `resend` | Transaktionaler E-Mail-Versand via Resend API |
| `@react-email/components` | UI-Komponenten für HTML-E-Mail-Templates |
| `react-email` | Dev-Preview-Server (lokal unter `:3002`) |

---

## E-Mail Templates

Drei Templates unter `src/emails/`:

| Template-Datei | Trigger | Empfänger |
|---|---|---|
| `bestellbestaetigung.tsx` | Nach `registerKunde()` im Funnel | Kunde |
| `magic-link.tsx` | Funnel Step 2 (ersetzt Supabase Standard-OTP-Mail) | Kunde |
| `monats-erinnerung.tsx` | pg_cron, 1× monatlich am 1. | Aktive Kunden ohne Lieferung im lfd. Monat |

Alle Templates sind reine React-Komponenten mit Props — kein Client-State, kein `useEffect`. Sie werden via `render()` aus `@react-email/render` zu HTML-Strings gerendert.

---

## Architektur

```
Trigger
  (Server Action / API Route / pg_cron)
        ↓
src/lib/email/sender.ts     ← sendEmail(to, subject, template) — dünner Resend-Wrapper
        ↓
Resend API → Postfach des Empfängers
```

`sendEmail()` nimmt eine bereits gerenderte React-Email-Komponente (als JSX-Element), ruft `render()` auf, und sendet via `resend.emails.send()`. Die Funktion wirft bei Fehler (kein Schlucken).

---

## Magic Link / OTP Flow

Ersetzt das Passwort-Feld in Funnel Step 2. Phase 2 verwendet `supabase.auth.signUp()` mit Passwort — Phase 5 ersetzt das:

```
Funnel Step 2 — Kein Passwort-Feld mehr, nur E-Mail

registerKunde() Server Action
  ↓ supabase.auth.admin.generateLink({ type: 'magiclink', email })
      → liefert hashed_token + action_link zurück (kein E-Mail-Versand durch Supabase)
  ↓ sendEmail() → magic-link.tsx Template mit action_link
  ↓ Weiter zu /beantragen/danke (Hinweis: „Wir haben dir eine E-Mail geschickt")

Kunde klickt Link in E-Mail
  ↓ /auth/callback?token_hash=...&type=magiclink
  ↓ supabase.auth.exchangeCodeForSession(token_hash)
  ↓ redirect → /konto/dashboard
```

**Warum `generateLink()` statt `signInWithOtp()`?**
`signInWithOtp()` sendet die E-Mail selbst (über Supabase SMTP). Mit `admin.generateLink()` haben wir den Link in der Hand und senden via Resend mit eigenem Branding — ohne Custom SMTP-Konfiguration in Supabase.

**Wichtig:** Supabase-Auth bleibt konfiguriert mit `Confirm email = false` (wie in Phase 2 festgelegt). Das Magic Link OTP ist der erste Login des Kunden nach der Registrierung.

---

## pg_cron — Monatliche Erinnerung

Supabase hat pg_cron vorinstalliert (per Extension). Wir aktivieren die Extension und richten einen Job ein, der am 1. jeden Monats 09:00 UTC einen Webhook an unsere API feuert:

```sql
-- Migration: enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;  -- für HTTP-Calls aus PostgreSQL

-- Job: monatliche Erinnerung
SELECT cron.schedule(
  'velacare-monthly-reminder',
  '0 9 1 * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.base_url') || '/api/cron/monthly-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body   := '{}'::jsonb
  );
  $$
);
```

**`/api/cron/monthly-reminder` (Next.js Route Handler):**
1. Prüft `Authorization: Bearer <CRON_SECRET>` — sonst `401`
2. Fragt alle KundenProfile ab, die aktiv sind und im laufenden Monat noch keine Lieferung haben
3. Sendet `MonatsErinnerungEmail` via `sendEmail()` für jeden Treffer
4. Gibt `{ sent: N }` zurück

`app.base_url` und `app.cron_secret` werden als Supabase DB-Einstellungen (`ALTER DATABASE ... SET`) gesetzt.

---

## Umgebungsvariablen

```bash
# .env.local (dev) + Vercel Environment Variables (prod)
RESEND_API_KEY=re_...             # Aus Resend Dashboard
RESEND_FROM=noreply@velacare.de   # Domain muss in Resend verifiziert sein
CRON_SECRET=<random-32-char>      # Absichern der /api/cron/* Routen
```

`RESEND_FROM` Domain-Verifikation: Resend verlangt DNS-Einträge (SPF, DKIM). Für Dev kann `onboarding@resend.dev` (Resend Sandbox) genutzt werden.

---

## Scope

### In Phase 5

- `resend` + `@react-email/components` installieren
- Resend-Client-Singleton + `sendEmail()` Helper
- 3 React-Email-Templates mit Velacare-Branding
- E-Mail-Preview-Script (`email:preview`)
- Bestellbestätigung nach `registerKunde()` (Phase 2 Server Action erweitern)
- Magic Link: Passwort-Feld aus Funnel Step 2 entfernen, OTP-Versand via `generateLink()` + Resend
- `/auth/callback` Route (prüfen / anlegen falls Phase 1/2 noch nicht vollständig)
- pg_cron Extension + Job-Migration
- `/api/cron/monthly-reminder` Route Handler

### Nicht in Phase 5

- Admin-Benachrichtigung bei neuer Anfrage → spätere Phase
- Versandbestätigung → hängt an Lieferungs-Workflow (Phase später)
- E-Mail-Präferenzen / Opt-out → Phase 6
- Bounce- und Complaint-Webhooks von Resend → spätere Phase
- HTML-E-Mail-Editor im Admin → viel später
- Weitere Cron-Jobs (automatische Box-Verlängerung) → spätere Phase

---

## Qualitätssicherung

- Templates lokal in React-Email-Preview prüfen (alle Clients: Desktop, Mobile, Dark Mode)
- `sendEmail()` im Dev mit Resend Sandbox testen (`onboarding@resend.dev`)
- `/api/cron/monthly-reminder` manuell mit `curl -H "Authorization: Bearer <secret>"` aufrufen
- Magic Link Flow end-to-end durchlaufen: Funnel Step 2 → E-Mail → Callback → Dashboard
