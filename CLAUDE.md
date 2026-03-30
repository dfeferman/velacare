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

## Architecture

**Velacare** is a German healthcare SaaS — a Next.js 14 App Router application that helps people with care needs (Pflegebedürftige) receive free monthly supply boxes funded by their statutory care insurance (Pflegekasse, up to €42/month per §40 SGB XI).

### Current State: Mock/Prototype
The entire app runs on **in-memory mock data** — there is no real backend, authentication, or database. `src/lib/mock-data.ts` holds static seed data; `src/lib/mock-store.tsx` provides a React Context store (`MockStoreProvider`) that wraps the root layout. All data mutations only persist within a browser session.

### Route Structure
| Route | Purpose |
|---|---|
| `/` | Landing page (hero, rechner, products teaser, testimonials, FAQ, CTA) |
| `/beantragen` | 4-step application funnel (see below) |
| `/beantragen/danke` | Success page after funnel completion |
| `/konto/*` | Customer portal (sidebar layout, mock-protected) |
| `/admin/*` | Admin dashboard (sidebar layout, mock-protected) |
| `/produkte`, `/faq`, `/kontakt`, `/ueber-uns`, `/wie-es-funktioniert`, `/login` | Public pages |

### Application Funnel (`/beantragen`)
The funnel is a single page component (`page.tsx`) managing step state locally, rendering one of four step components:
1. **Step 1 – Anspruch**: Eligibility check (Pflegegrad 1–5, home care)
2. **Step 2 – Daten**: Personal data entry
3. **Step 3 – Box**: Product configurator (budget-tracked, sticky UI)
4. **Step 4 – Bestätigung**: Order review and confirmation

Steps receive `onWeiter`/`onZurueck` callbacks. The `FunnelHeader` replaces the main `Nav` inside the funnel (the root layout still renders Nav, but the funnel layout overrides the header).

### Component Organization
- `src/components/ui/` — Primitive components: `Button`, `ProgressBar`, `Accordion`, `Badge`
- `src/components/funnel/` — Funnel-specific: `FunnelHeader`, `Fortschrittsbalken`
- `src/components/landing/` — `LandingHero`, `PflegekasseRechner`
- `src/components/layout/` — `Nav`, `Footer`, `AdminSidebar`, `KontoSidebar`
- `src/components/brand/` — `VelacareLogo`
- `src/components/box-konfigurator/` — Reusable box configurator (also used in `/konto/meine-box`)

### Design System
Tailwind with a custom brand palette defined in `tailwind.config.ts`:
- **terra** (`#C96B3F`) — primary brand/CTA color
- **sage** (`#2D7A5F`) — success/confirmation states
- **dark** (`#2C2420`) — primary text
- **bg** (`#F5F0EB`) — page background (warm off-white)
- **warm-white** (`#FDFAF7`) — card/surface background
- **warm-gray** (`#8A8078`) — secondary text

Fonts (loaded via Google Fonts in `globals.css`):
- `font-serif` → Cormorant Garamond (headings, hero, brand)
- `font-sans` → DM Sans (body, UI)
- `font-mono` → DM Mono

### Path Alias
`@/` resolves to `src/`. Use `@/components/...`, `@/lib/...` etc.

### Wireframes
Reference designs live in `wireframes/` as Stitch SDK exports and HTML files. Comments in component files reference the relevant wireframe (e.g., `/* wireframes/01-startseite-hero-zuerst */`). Detailed docs/brand guidelines are in `docs/konzept/`.
