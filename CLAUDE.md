# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://localhost:3001
npm run build      # Production build
npm run lint       # ESLint (next/core-web-vitals, next/typescript)
npm run stitch:wireframes  # Export Stitch wireframes via scripts/export-stitch-wireframes.mjs
```

No test suite exists yet.

## Dev Quirks & Gotchas

**Build**: `npm run build` always fails at static export (Supabase URL missing in build env). `✓ Compiled successfully` in the output is the relevant TypeScript check — treat that as green.

**Prisma**: After any `schema.prisma` change run `npx prisma generate` to regenerate the TS client, even without a live DB. Otherwise type errors appear that don't match the schema.

**Next.js 15**: Use `useActionState` (not `useFormState` — that's Next.js 14/React 18).

**Supabase MFA SDK**: Method is `getAuthenticatorAssuranceLevel()` — singular, not plural.

**JSX / German text**: Characters like `„"` trigger `react/no-unescaped-entities`. Escape as `&bdquo;`/`&ldquo;` or `&apos;` for apostrophes.

**Windows**: LF→CRLF warnings on git operations are harmless — ignore.

**Mock data**: `src/lib/mock-data.ts` and `src/lib/mock-store.tsx` are deleted. Products come from `getAktiveProdukte()` in `src/lib/dal/produkte.ts`.

## Architecture

**Velacare** is a German healthcare SaaS — a Next.js 14 App Router application that helps people with care needs (Pflegebedürftige) receive free monthly supply boxes funded by their statutory care insurance (Pflegekasse, up to €42/month per §40 SGB XI).

### Current State: Production-Ready (pre-deploy)
All 6 implementation phases are complete. The app uses **real Supabase/Prisma infrastructure** — authentication (magic link), database writes, field encryption (AES-256-GCM), audit logging, and MFA for admins. Mock data has been removed.

**Before deploying to production**, work through the checklist:
→ [`docs/superpowers/PRODUCTION-CHECKLIST.md`](docs/superpowers/PRODUCTION-CHECKLIST.md)

Key items: run `prisma migrate deploy`, configure pg_cron in Supabase SQL editor, set all 10 env vars in Vercel (especially `FIELD_ENCRYPTION_KEY` — back it up externally, it cannot be rotated without a data migration).

### Route Structure
| Route | Purpose |
|---|---|
| `/` | Landing page (hero, rechner, products teaser, testimonials, FAQ, CTA) |
| `/beantragen` | 4-step application funnel (see below) |
| `/beantragen/danke` | Success page after funnel completion |
| `/auth/callback` | Magic link OTP callback (verifyOtp → redirect to /konto) |
| `/login/mfa` | TOTP MFA step for admin login |
| `/konto/*` | Customer portal (sidebar layout, Supabase-auth-protected) |
| `/admin/*` | Admin dashboard (sidebar layout, requireAdmin() + AAL2 MFA check) |
| `/produkte`, `/faq`, `/kontakt`, `/ueber-uns`, `/wie-es-funktioniert`, `/login` | Public pages |

### Application Funnel (`/beantragen`)
The funnel is a single page component (`page.tsx`) managing step state locally, rendering one of four step components:
1. **Step 1 – Anspruch**: Eligibility check (Pflegegrad 1–5, home care)
2. **Step 2 – Daten**: Personal data entry
3. **Step 3 – Box**: Product configurator (budget-tracked, sticky UI)
4. **Step 4 – Bestätigung**: Order review and confirmation

Steps receive `onWeiter`/`onZurueck` callbacks. The `FunnelHeader` replaces the main `Nav` inside the funnel (the root layout still renders Nav, but the funnel layout overrides the header).

### Key Backend Files
- `src/lib/crypto/field-encryption.ts` — AES-256-GCM encrypt/decrypt for sensitive KundenProfile fields
- `src/lib/dal/` — Data Access Layer: `konto.ts`, `admin.ts`, `produkte.ts`, `audit.ts`
- `src/lib/auth/require-admin.ts` — Server-side admin guard with AAL2 (MFA) check
- `src/app/actions/register.ts` — `registerKunde()`: generateLink + Prisma transaction + compensation logic
- `src/app/api/cron/monthly-reminder/route.ts` — Idempotent monthly reminder (EmailDelivery dedup)
- `prisma/schema.prisma` — 13 models; `geburtsdatum`/`pflegegrad` stored as encrypted strings

### Component Organization
- `src/components/ui/` — Primitive components: `Button`, `ProgressBar`, `Accordion`, `Badge`
- `src/components/funnel/` — Funnel-specific: `FunnelHeader`, `Fortschrittsbalken`
- `src/components/landing/` — `LandingHero`, `PflegekasseRechner`
- `src/components/layout/` — `Nav`, `Footer`, `AdminSidebar`, `KontoSidebar`
- `src/components/brand/` — `VelacareLogo`
- `src/components/box-konfigurator/` — Reusable box configurator (also used in `/konto/meine-box`)

### Design System (canonical: v3)

**Source of truth:** [`wireframes/v3/design.md`](wireframes/v3/design.md) — *Produktdesign-Richtlinien v3.0* (Farben, Typo, Komponenten, Animation, Do’s/Don’ts). For HTML references in that generation, see `wireframes/v3/*.html`. When implementing or reviewing UI, treat that document as authoritative; align Tailwind/CSS with it over time.

**North star (from design.md):** “Warme Autorität” — medical trust + human warmth; editorial spacing; **no cold blues as primaries**; avoid hard 1px section borders (use tonal section backgrounds, spacing, ghost borders ≤20–35% opacity).

**v3 tokens (summary — full table in design.md):**

| Role | Token / note | Hex (reference) |
|------|----------------|-----------------|
| Primary (CTA, links, accents) | `primary` | `#4A7259` |
| Primary hover / mid | `primary-mid` | `#5E8C6E` |
| Secondary (logo heart, deco, italic accents) | `secondary` | `#9E5A35` |
| Page background | `background` | `#FAF6EF` |
| Cards / elevated surfaces | `surface` | `#FFFDF7` |
| Primary text | `dark` / `on-surface` | `#261E17` |
| Secondary text | `on-surface-variant` | `#6B5747` |
| Dividers / soft borders | `outline` | `#D5CAB9` |
| Section alternation | `section-warm`, `section-terra` (+ pale variants) | per design.md |

**Typography (v3):** Headlines — **Newsreader** (`font-newsreader` in Tailwind). Body & UI — **DM Sans** (`font-sans`). Technical — **DM Mono** (`font-mono`). *design.md* specifies weights, eyebrow/label styles, and the **deco-rule** (44×2px gradient `secondary` → `secondary-light`) before headlines.

**Code today (transitional):** `tailwind.config.ts` still exposes older names (**terra**, **sage**, **bg**, **dark** `#2C2420`, etc.) and `font-serif` (Cormorant). Prefer mapping new work to **v3** semantics from `design.md`; use **Newsreader** for new hero/editorial headings where the spec applies. Global styles and tokens live in `globals.css` + `tailwind.config.ts`.

**Animation / motion:** Follow §6 in `design.md` (durations, easing, `prefers-reduced-motion`, skeletons not spinners, card lift, bar fill, etc.).

### Path Alias
`@/` resolves to `src/`. Use `@/components/...`, `@/lib/...` etc.

### Wireframes
Reference designs live in `wireframes/` (including **v3** under `wireframes/v3/`). Comments in component files may cite older paths (e.g. `/* wireframes/01-startseite-hero-zuerst */`). **Product design rules for v3:** [`wireframes/v3/design.md`](wireframes/v3/design.md). Additional concept docs: `docs/konzept/`, `docs/superpowers/specs/`.
