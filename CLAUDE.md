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
