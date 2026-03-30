# Phase 5 E-Mail & Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transaktionale E-Mails via Resend + React Email; Magic Link / OTP ersetzt Passwort-Feld im Funnel; monatliche Erinnerungs-E-Mail via pg_cron (idempotent).

**Architecture:** `sendEmail()` ist ein dünner Wrapper um Resend mit lazy Konfigurationsvalidierung. Templates sind reine React-Komponenten unter `src/emails/`. Nach der Registrierung wird genau eine E-Mail gesendet (Bestellbestätigung + Magic Link kombiniert). pg_cron feuert einen Webhook auf `/api/cron/monthly-reminder`; ein `EmailDelivery`-Log verhindert Doppelversand.

**Auth-Flow-Entscheidung:** Magic Link via `admin.generateLink({ type: 'magiclink' })`. Der zurückgegebene `hashed_token` wird zu einer eigenen Callback-URL zusammengebaut (`/auth/callback?token_hash=...&type=magiclink`). Diese URL geht in die E-Mail (via Resend). Die Callback-Route ruft `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` auf — das ist der einzige, verbindliche Flow.

**Versandentscheidung nach Registrierung:** Genau eine E-Mail — kombinierte Bestellbestätigung + Magic-Link-Button. Keine separate Magic-Link-Mail.

**Tech Stack:** Next.js 14 App Router · Resend SDK · React Email · `@supabase/ssr` (admin client für generateLink) · Prisma 5 · TypeScript

**Abhängigkeit:** Phase 1 (Supabase Auth, Prisma, `createClient`, `createAdminClient`) und Phase 2 (`registerKunde()` Server Action) müssen implementiert sein.

---

## File Structure

```
src/
  emails/
    bestellbestaetigung.tsx        NEW — Kombinierte Bestellbestätigung + Magic-Link Template
    monats-erinnerung.tsx           NEW — Monatliche Erinnerungs-Template
    _components/
      email-layout.tsx              NEW — Gemeinsames Layout (Header, Footer, Brand-Farben)
  lib/
    email/
      sender.ts                     NEW — sendEmail() Wrapper um Resend (lazy validation)
      resend.ts                     NEW — getResendClient() Factory (lazy, nicht Singleton)
  app/
    auth/
      callback/
        route.ts                    NEW — Magic Link Callback Route (verifyOtp)
    api/
      cron/
        monthly-reminder/
          route.ts                  NEW — Cron Webhook Route Handler (mit Idempotenz-Check)
    actions/
      auth.ts                       MODIFY — registerKunde(): generateLink + kombinierte E-Mail
  beantragen/
    _components/
      step-daten.tsx                MODIFY — Passwort-Feld entfernen, Hinweis ergänzen

prisma/
  schema.prisma                     MODIFY — EmailDelivery-Modell ergänzen
  migrations/
    YYYYMMDD_add_email_delivery/
      migration.sql                 AUTO — prisma migrate dev
    YYYYMMDD_enable_pg_cron/
      migration.sql                 NEW — pg_cron + pg_net aktivieren + Job anlegen

.env.local.example                  MODIFY — RESEND_API_KEY, RESEND_FROM, CRON_SECRET, APP_URL
package.json                        MODIFY — resend, @react-email/components, react-email
```

---

## Task 1: Dependencies + Env-Vars

**Files:**
- Modify: `package.json`
- Modify: `.env.local.example`
- Modify: `.env.local` (lokal, nie committen)

- [ ] **Step 1: Packages installieren**

```bash
npm install resend @react-email/components react-email
```

Erwartet: `package.json` enthält die drei neuen Packages.

- [ ] **Step 2: `.env.local.example` ergänzen**

Folgende Zeilen hinzufügen (nach den bestehenden Supabase-Vars):

```bash
# Resend — E-Mail Versand
RESEND_API_KEY=re_...
RESEND_FROM=noreply@velacare.de

# App — Serverseitige Basis-URL (für E-Mails, Callbacks, Cron-Webhooks)
# Kein NEXT_PUBLIC_ — wird nur serverseitig verwendet
APP_URL=http://localhost:3001

# Cron — Absicherung der /api/cron/* Routen
CRON_SECRET=your-random-32-char-secret
```

`APP_URL` ist die serverseitige Basis-URL für alle generierten Links (E-Mails, Magic-Link-Callbacks, Cron-Webhooks). Nicht mit `NEXT_PUBLIC_APP_URL` (client-seitig) verwechseln.

- [ ] **Step 3: `.env.local` befüllen**

Für Dev-Zwecke:
- `RESEND_API_KEY`: Aus dem Resend-Dashboard (https://resend.com → API Keys)
- `RESEND_FROM`: Im Dev `onboarding@resend.dev` (Resend Sandbox, kein DNS nötig)
- `APP_URL`: `http://localhost:3001`
- `CRON_SECRET`: Beliebige zufällige Zeichenkette (z.B. `openssl rand -hex 16`)

In Vercel (Prod): `APP_URL=https://velacare.de`, `RESEND_FROM=noreply@velacare.de` (Domain muss in Resend verifiziert sein).

- [ ] **Step 4: `package.json` Script ergänzen**

Im `scripts`-Block hinzufügen:

```json
"email:preview": "email dev --dir src/emails --port 3002"
```

- [ ] **Step 5: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler. Neue Packages importierbar.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add resend, react-email dependencies and env vars"
```

---

## Task 2: Resend Client + sendEmail() Helper

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/sender.ts`

- [ ] **Step 1: Resend-Client als Factory-Funktion anlegen**

Kein Singleton-Export — stattdessen eine Funktion, die beim Aufruf validiert. So schlägt kein Build fehl, wenn `RESEND_API_KEY` in einer Umgebung nicht gesetzt ist, in der E-Mail-Versand nie aufgerufen wird.

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(apiKey)
}
```

- [ ] **Step 2: sendEmail() Helper anlegen**

```typescript
// src/lib/email/sender.ts
import { render } from '@react-email/components'
import { getResendClient } from './resend'
import type { ReactElement } from 'react'

interface SendEmailOptions {
  to: string
  subject: string
  template: ReactElement
}

export async function sendEmail({ to, subject, template }: SendEmailOptions): Promise<string> {
  const from = process.env.RESEND_FROM
  if (!from) {
    throw new Error('RESEND_FROM is not set')
  }

  const html = await render(template)
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({ from, to, subject, html })

  if (error || !data?.id) {
    throw new Error(
      `E-Mail-Versand fehlgeschlagen an ${to}: ${error?.message ?? 'kein data.id'}`
    )
  }

  return data.id  // Resend Message-ID für Logging
}
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

Erwartet: kein TypeScript-Fehler.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/
git commit -m "feat: add Resend client factory and sendEmail() helper"
```

---

## Task 3: E-Mail Layout (Gemeinsame Basis)

**Files:**
- Create: `src/emails/_components/email-layout.tsx`

- [ ] **Step 1: Gemeinsames Layout anlegen**

```tsx
// src/emails/_components/email-layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

const brand = {
  terra: '#C96B3F',
  dark: '#2C2420',
  bg: '#F5F0EB',
  warmWhite: '#FDFAF7',
  warmGray: '#8A8078',
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: 'DM Sans, sans-serif' }}>
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: brand.warmWhite,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Section style={{ backgroundColor: brand.terra, padding: '24px 32px' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                letterSpacing: '0.02em',
              }}
            >
              Velacare
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: '32px' }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ borderColor: brand.bg, margin: 0 }} />
          <Section style={{ padding: '20px 32px', backgroundColor: brand.bg }}>
            <Text
              style={{ color: brand.warmGray, fontSize: '12px', margin: 0, lineHeight: '1.6' }}
            >
              Velacare GmbH · Musterstraße 1 · 10115 Berlin
              <br />
              Du erhältst diese E-Mail, weil du dich bei Velacare registriert hast.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/emails/_components/
git commit -m "feat: add shared email layout component"
```

---

## Task 4: Kombinierte Bestellbestätigung + Magic-Link Template

**Files:**
- Create: `src/emails/bestellbestaetigung.tsx`

Ein Template, das nach der Registrierung gesendet wird. Enthält Bestellbestätigung und den Magic-Link-Button — keine separate Magic-Link-Mail.

- [ ] **Step 1: Template anlegen**

```tsx
// src/emails/bestellbestaetigung.tsx
import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import { EmailLayout } from './_components/email-layout'

interface BestellbestaetigungEmailProps {
  vorname: string
  nachname: string
  pflegegrad: number
  budgetGenutzt: number  // in Cent
  magicLinkUrl: string   // Einmallink zum ersten Konto-Login
  expiresInMinutes?: number
}

export function BestellbestaetigungEmail({
  vorname,
  nachname,
  pflegegrad,
  budgetGenutzt,
  magicLinkUrl,
  expiresInMinutes = 60,
}: BestellbestaetigungEmailProps) {
  const budgetEuro = (budgetGenutzt / 100).toFixed(2).replace('.', ',')

  return (
    <EmailLayout preview={`Dein Antrag ist eingegangen, ${vorname}!`}>
      <Heading
        style={{
          fontSize: '24px',
          color: '#2C2420',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          marginTop: 0,
        }}
      >
        Dein Antrag ist eingegangen!
      </Heading>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        Hallo {vorname} {nachname},
      </Text>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        wir haben deinen Antrag auf eine Pflegehilfsmittel-Box (Pflegegrad {pflegegrad})
        erfolgreich erhalten. Deine ausgewählten Produkte im Wert von{' '}
        <strong>{budgetEuro} €</strong> werden von deiner Pflegekasse übernommen.
      </Text>

      <Section
        style={{
          backgroundColor: '#F5F0EB',
          borderRadius: '8px',
          padding: '16px 20px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{ color: '#2C2420', fontSize: '15px', margin: '0 0 4px 0', fontWeight: '600' }}
        >
          Was passiert als nächstes?
        </Text>
        <Text style={{ color: '#8A8078', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Wir prüfen deinen Antrag und leiten ihn an deine Pflegekasse weiter.
          Das dauert in der Regel 2–5 Werktage. Du erhältst eine Benachrichtigung,
          sobald deine Box auf dem Weg ist.
        </Text>
      </Section>

      <Hr style={{ borderColor: '#E8E0D8', margin: '28px 0' }} />

      <Text
        style={{ color: '#2C2420', fontSize: '15px', fontWeight: '600', margin: '0 0 8px 0' }}
      >
        Dein Konto ist bereit
      </Text>
      <Text style={{ color: '#8A8078', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
        Klicke auf den Button, um deinen Antrag zu verfolgen. Der Link ist{' '}
        {expiresInMinutes} Minuten gültig.
      </Text>

      <Button
        href={magicLinkUrl}
        style={{
          backgroundColor: '#C96B3F',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Antrag verfolgen →
      </Button>

      <Text
        style={{ color: '#8A8078', fontSize: '12px', lineHeight: '1.5', marginTop: '20px' }}
      >
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
        <br />
        <span style={{ color: '#C96B3F', wordBreak: 'break-all' }}>{magicLinkUrl}</span>
      </Text>
    </EmailLayout>
  )
}

export default BestellbestaetigungEmail
```

- [ ] **Step 2: Template in Preview prüfen**

```bash
npm run email:preview
```

Browser öffnen auf `http://localhost:3002`. Template mit Beispieldaten kontrollieren — Bestellinfo und Button sichtbar.

- [ ] **Step 3: Commit**

```bash
git add src/emails/bestellbestaetigung.tsx
git commit -m "feat: add combined Bestellbestätigung + MagicLink email template"
```

---

## Task 5: Monats-Erinnerungs-Template

**Files:**
- Create: `src/emails/monats-erinnerung.tsx`

- [ ] **Step 1: Template anlegen**

```tsx
// src/emails/monats-erinnerung.tsx
import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout } from './_components/email-layout'

interface MonatsErinnerungEmailProps {
  vorname: string
  monat: string       // z.B. "April 2026"
  kontoUrl: string
}

export function MonatsErinnerungEmail({
  vorname,
  monat,
  kontoUrl,
}: MonatsErinnerungEmailProps) {
  return (
    <EmailLayout preview={`Deine Pflegehilfsmittel für ${monat} sind noch verfügbar`}>
      <Heading
        style={{
          fontSize: '24px',
          color: '#2C2420',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          marginTop: 0,
        }}
      >
        Dein Budget für {monat} wartet
      </Heading>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        Hallo {vorname},
      </Text>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        dein monatliches Budget für Pflegehilfsmittel über deine Pflegekasse steht für{' '}
        <strong>{monat}</strong> bereit — bis zu 42 € werden erstattet. Du hast für
        diesen Monat noch keine Lieferung bestellt.
      </Text>

      <Section
        style={{
          backgroundColor: '#F5F0EB',
          borderRadius: '8px',
          padding: '16px 20px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{ color: '#2C2420', fontSize: '15px', margin: '0 0 4px 0', fontWeight: '600' }}
        >
          Nicht vergessen: Das Budget verfällt am Monatsende.
        </Text>
        <Text style={{ color: '#8A8078', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Nicht genutzte Leistungen können nicht in den Folgemonat übertragen werden.
        </Text>
      </Section>

      <Button
        href={kontoUrl}
        style={{
          backgroundColor: '#C96B3F',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Jetzt Box bestellen →
      </Button>
    </EmailLayout>
  )
}

export default MonatsErinnerungEmail
```

- [ ] **Step 2: Beide Templates in Preview prüfen**

```bash
npm run email:preview
```

Auf `http://localhost:3002` beide Templates (`bestellbestaetigung`, `monats-erinnerung`) kontrollieren.

- [ ] **Step 3: Commit**

```bash
git add src/emails/monats-erinnerung.tsx
git commit -m "feat: add MonatsErinnerung email template"
```

---

## Task 6: Magic Link OTP im Funnel + Kombinierte E-Mail senden

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Modify: `src/app/actions/auth.ts`
- Modify: `src/beantragen/_components/step-daten.tsx`

### 6a: `/auth/callback` Route anlegen

Der verbindliche Flow: `generateLink()` liefert `hashed_token` → wir bauen `/auth/callback?token_hash=...&type=magiclink` → Callback-Route ruft `verifyOtp()` auf.

- [ ] **Step 1: Route anlegen**

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // Nur magiclink-Typ unterstützt
  if (token_hash && type === 'magiclink') {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'magiclink',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}/konto/dashboard`)
    }

    console.error('Magic Link verifyOtp fehlgeschlagen:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=link-ungueltig`)
}
```

- [ ] **Step 2: Build prüfen**

```bash
npm run build
```

### 6b: registerKunde() — signUp() durch generateLink() + kombinierte E-Mail ersetzen

- [ ] **Step 3: Imports in `registerKunde()` ergänzen**

Am Anfang von `src/app/actions/auth.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { BestellbestaetigungEmail } from '@/emails/bestellbestaetigung'
```

- [ ] **Step 4: signUp() ersetzen und Magic Link + kombinierte E-Mail senden**

`supabase.auth.signUp({ email, password })` ersetzen durch:

```typescript
const adminSupabase = createAdminClient()

const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
  type: 'magiclink',
  email: formData.email,
})

if (linkError || !linkData.properties?.hashed_token) {
  console.error('generateLink fehlgeschlagen:', linkError?.message)
  return { error: 'Konto konnte nicht erstellt werden. Bitte versuche es erneut.' }
}

const appUrl = process.env.APP_URL
if (!appUrl) throw new Error('APP_URL is not set')

const magicLinkUrl =
  `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`
```

Direkt danach, nach allen Prisma-Writes, vor `redirect()`:

```typescript
// Kombinierte E-Mail: Bestellbestätigung + Magic Link
// Fehler werden geloggt, brechen Registrierung nicht ab
try {
  await sendEmail({
    to: formData.email,
    subject: 'Dein Antrag ist eingegangen – Velacare',
    template: BestellbestaetigungEmail({
      vorname: formData.vorname,
      nachname: formData.nachname,
      pflegegrad: formData.pflegegrad,
      budgetGenutzt: berechneteBudgetInCent,
      magicLinkUrl,
      expiresInMinutes: 60,
    }),
  })
} catch (emailError) {
  console.error('Bestellbestätigung/MagicLink konnte nicht gesendet werden:', {
    email: formData.email,
    error: emailError,
  })
  // Registrierung trotzdem erfolgreich
}
```

### 6c: Passwort-Feld aus Funnel-Step-2-Komponente entfernen

- [ ] **Step 5: Passwort-Feld entfernen**

In `step-daten.tsx`:
- `<input type="password" ...>` entfernen
- Passwort aus Zod-Schema entfernen
- Hinweis unter E-Mail-Feld ergänzen:

```tsx
<p className="text-sm text-warm-gray mt-1">
  Du erhältst per E-Mail einen Einmallink für deinen Kontozugang — kein Passwort nötig.
</p>
```

- [ ] **Step 6: Build prüfen**

```bash
npm run build
```

- [ ] **Step 7: Flow manuell testen**

1. Funnel bis Step 4 durchlaufen — kein Passwort-Feld in Step 2
2. Formular absenden
3. In Resend Dashboard (→ Logs): eine kombinierte E-Mail erscheint (nicht zwei)
4. Link aus E-Mail öffnen → landet auf `/konto/dashboard`
5. Nochmals denselben Link öffnen → landet auf `/login?error=link-ungueltig` (Link ist verbraucht)

- [ ] **Step 8: Commit**

```bash
git add src/app/auth/callback/route.ts src/beantragen/ src/app/actions/auth.ts
git commit -m "feat: magic link OTP in funnel — remove password field, send combined email"
```

---

## Task 7: EmailDelivery-Modell (Versandlog für Idempotenz)

**Files:**
- Modify: `prisma/schema.prisma`
- Auto-generate: `prisma/migrations/...`

Schützt den monatlichen Reminder vor Doppelversand. Jede gesendete E-Mail wird mit `kind`, `kundeId` und `periodKey` (z.B. `2026-04`) geloggt. Unique-Constraint verhindert, dass dieselbe Mail im selben Monat zweimal rausgeht.

- [ ] **Step 1: Modell in `schema.prisma` ergänzen**

```prisma
model EmailDelivery {
  id              String   @id @default(cuid())
  kind            String   // z.B. "monthly-reminder", "bestellbestaetigung"
  kundeId         String
  periodKey       String   // z.B. "2026-04" (für Monats-Jobs), oder cuid() für einmalige Mails
  providerMsgId   String?  // Resend Message-ID
  sentAt          DateTime @default(now())

  kunde           KundenProfile @relation(fields: [kundeId], references: [id])

  @@unique([kind, kundeId, periodKey])
  @@index([kundeId])
}
```

Außerdem in `KundenProfile` die Rückrelation ergänzen:

```prisma
emailDeliveries   EmailDelivery[]
```

- [ ] **Step 2: Migration generieren und anwenden**

```bash
npx prisma migrate dev --name add_email_delivery
```

Erwartet: neue Migration in `prisma/migrations/`, Prisma Client regeneriert.

- [ ] **Step 3: Build prüfen**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add EmailDelivery model for idempotent email logging"
```

---

## Task 8: pg_cron Migration + Monthly-Reminder Route (idempotent)

**Files:**
- Create: `prisma/migrations/YYYYMMDD_enable_pg_cron/migration.sql`
- Create: `src/app/api/cron/monthly-reminder/route.ts`

### 8a: pg_cron SQL-Migration

- [ ] **Step 1: Migration-Ordner und -Datei anlegen**

Ordner: `prisma/migrations/<datum>_enable_pg_cron/`
Datei: `migration.sql`

```sql
-- Aktiviere pg_cron und pg_net (in Supabase bereits als Extensions verfügbar)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Job idempotent anlegen: erst entfernen falls vorhanden, dann neu anlegen
SELECT cron.unschedule('velacare-monthly-reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'velacare-monthly-reminder'
);

SELECT cron.schedule(
  'velacare-monthly-reminder',
  '0 9 1 * *',
  $cron$
  SELECT net.http_post(
    url    := current_setting('app.base_url') || '/api/cron/monthly-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body   := '{}'::jsonb
  );
  $cron$
);

-- HINWEIS: Nach der Migration manuell im Supabase SQL-Editor ausführen:
-- ALTER DATABASE postgres SET app.base_url = 'https://velacare.de';
-- ALTER DATABASE postgres SET app.cron_secret = '<CRON_SECRET>';
--
-- Für Dev/Preview-Umgebungen den Job deaktivieren oder app.base_url auf
-- einen ngrok-Tunnel zeigen lassen. Niemals auf localhost setzen —
-- pg_cron läuft im Supabase-Backend und kann localhost nicht erreichen.
```

- [ ] **Step 2: Migration in Supabase einspielen**

```bash
npx prisma migrate deploy
```

- [ ] **Step 3: `app.base_url` und `app.cron_secret` in Supabase setzen**

Im Supabase SQL-Editor:

```sql
ALTER DATABASE postgres SET app.base_url = 'https://velacare.de';
ALTER DATABASE postgres SET app.cron_secret = '<CRON_SECRET aus .env.local>';
```

### 8b: `/api/cron/monthly-reminder` Route anlegen

- [ ] **Step 4: Route Handler mit Idempotenz-Check anlegen**

```typescript
// src/app/api/cron/monthly-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/sender'
import { MonatsErinnerungEmail } from '@/emails/monats-erinnerung'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.APP_URL
  if (!appUrl) {
    return NextResponse.json({ error: 'APP_URL is not set' }, { status: 500 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monatLabel = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const startedAt = Date.now()

  // Aktive Kunden ohne Lieferung im laufenden Monat
  const kunden = await prisma.kundenProfile.findMany({
    where: {
      status: 'aktiv',
      lieferungen: {
        none: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      },
    },
    select: { id: true, vorname: true, email: true },
  })

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const kunde of kunden) {
    // Idempotenz: bereits versendet in diesem Monat?
    const alreadySent = await prisma.emailDelivery.findUnique({
      where: {
        kind_kundeId_periodKey: {
          kind: 'monthly-reminder',
          kundeId: kunde.id,
          periodKey,
        },
      },
    })

    if (alreadySent) {
      skipped++
      continue
    }

    try {
      const providerMsgId = await sendEmail({
        to: kunde.email,
        subject: `Dein Budget für ${monatLabel} wartet – Velacare`,
        template: MonatsErinnerungEmail({
          vorname: kunde.vorname,
          monat: monatLabel,
          kontoUrl: `${appUrl}/konto/meine-box`,
        }),
      })

      await prisma.emailDelivery.create({
        data: {
          kind: 'monthly-reminder',
          kundeId: kunde.id,
          periodKey,
          providerMsgId,
        },
      })

      sent++
    } catch (error) {
      failed++
      console.error('Monats-Erinnerung fehlgeschlagen:', {
        kundeId: kunde.id,
        email: kunde.email,
        periodKey,
        error,
      })
    }
  }

  const durationMs = Date.now() - startedAt
  console.info('monthly-reminder abgeschlossen:', {
    periodKey,
    total: kunden.length,
    sent,
    skipped,
    failed,
    durationMs,
  })

  return NextResponse.json({ periodKey, total: kunden.length, sent, skipped, failed })
}
```

- [ ] **Step 5: Build prüfen**

```bash
npm run build
```

- [ ] **Step 6: Route manuell testen**

```bash
# Erwartet: { periodKey: "...", total: 0, sent: 0, skipped: 0, failed: 0 }
curl -X POST http://localhost:3001/api/cron/monthly-reminder \
  -H "Authorization: Bearer <CRON_SECRET aus .env.local>" \
  -H "Content-Type: application/json"

# Erwartet: { "error": "Unauthorized" } mit 401
curl -X POST http://localhost:3001/api/cron/monthly-reminder
```

Idempotenz testen: Route zweimal aufrufen — beim zweiten Aufruf muss `skipped` steigen, `sent` darf sich nicht erhöhen.

- [ ] **Step 7: Commit**

```bash
git add prisma/migrations/ src/app/api/cron/
git commit -m "feat: pg_cron migration and idempotent monthly-reminder route"
```

---

## Task 9: ROADMAP aktualisieren

**Files:**
- Modify: `docs/superpowers/ROADMAP.md`

- [ ] **Step 1: Phase 5 auf ✅ setzen**

```markdown
| 5     | E-Mail & Jobs (Resend, pg_cron)                 | ✅    | ✅    | ✅    |
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/ROADMAP.md
git commit -m "docs: update ROADMAP — Phase 5 fertig"
```
