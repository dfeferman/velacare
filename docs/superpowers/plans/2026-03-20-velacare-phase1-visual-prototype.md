# Velacare Phase 1 — Visual Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vollständig klickbarer visueller Prototyp der Velacare Web-App mit Mock-Daten — kein Backend, kein Auth, bereit für Stakeholder-Feedback.

**Architecture:** Next.js 14 App Router mit TypeScript. Alle Daten kommen aus `src/lib/mock-data.ts` (statische Objekte) und `src/lib/mock-store.ts` (In-Memory-State für Admin-CRUD via React Context). Kein echter Submit, kein Login — alles direkt navigierbar.

**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · Zod (client-side Validierung) · React Context (Mock-Store)

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, nav, footer)
│   ├── page.tsx                      # Landing Page /
│   ├── login/page.tsx                # Placeholder /login
│   ├── beantragen/
│   │   ├── page.tsx                  # Funnel-Container (Step-State)
│   │   ├── step1-anspruch.tsx        # Schritt 1: Anspruch prüfen
│   │   ├── step2-daten.tsx           # Schritt 2: Persönliche Daten
│   │   ├── step3-box.tsx             # Schritt 3: Box-Konfigurator
│   │   ├── step4-bestaetigung.tsx    # Schritt 4: Bestätigung
│   │   └── danke/page.tsx            # Danke-Seite
│   ├── konto/
│   │   ├── layout.tsx                # Konto-Layout (Sidebar-Nav)
│   │   ├── page.tsx                  # Dashboard
│   │   ├── meine-box/page.tsx        # Box-Konfigurator (bearbeitbar)
│   │   ├── lieferungen/page.tsx      # Lieferverlauf
│   │   ├── anfragen/page.tsx         # Anfragen
│   │   └── einstellungen/page.tsx    # Einstellungen
│   ├── admin/
│   │   ├── layout.tsx                # Admin-Layout (Sidebar-Nav)
│   │   ├── page.tsx                  # Admin-Dashboard
│   │   ├── kunden/
│   │   │   ├── page.tsx              # Kundenliste
│   │   │   └── [id]/page.tsx         # Kundendetail
│   │   ├── produkte/page.tsx         # Produktverwaltung (CRUD via mock-store)
│   │   ├── lieferungen/page.tsx      # Lieferverwaltung
│   │   └── anfragen/page.tsx         # Support-Tickets
│   ├── wie-es-funktioniert/page.tsx
│   ├── produkte/page.tsx
│   ├── faq/page.tsx
│   ├── ueber-uns/page.tsx
│   └── kontakt/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx                # Button (variants: primary, secondary, ghost)
│   │   └── badge.tsx                 # Badge (terra, sage, sky, amber, red, gray)
│   ├── layout/
│   │   ├── nav.tsx                   # Öffentliche Navigation
│   │   ├── footer.tsx                # Footer
│   │   ├── konto-sidebar.tsx         # Kundenportal-Sidebar
│   │   └── admin-sidebar.tsx         # Admin-Sidebar
│   ├── box-konfigurator/
│   │   ├── konfigurator.tsx          # Hauptkomponente (Filter + Grid + Sidebar)
│   │   ├── produkt-karte.tsx         # Einzelne Produktkarte
│   │   └── budget-anzeige.tsx        # Live-Budget-Counter
│   └── funnel/
│       └── fortschrittsbalken.tsx    # Schritt-Fortschrittsbalken
├── lib/
│   ├── mock-data.ts                  # Statische Mock-Daten (Produkte, Kunden, Lieferungen)
│   ├── mock-store.ts                 # React Context für Admin-CRUD (In-Memory-State)
│   └── types.ts                      # Shared TypeScript-Typen
└── styles/
    └── globals.css                   # Tailwind-Imports + CSS-Variablen (Design-System)
```

---

## Task 1: Projekt-Setup & Design-System

**Files:**
- Create: `src/styles/globals.css`
- Create: `src/lib/types.ts`
- Create: `src/app/layout.tsx`
- Create: `tailwind.config.ts`
- Modify: `package.json` (zod hinzufügen)

- [ ] **Step 1: Next.js-Projekt anlegen**

```bash
npx create-next-app@14 velacare --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd velacare
npm install zod clsx
```

- [ ] **Step 2: Tailwind-Konfiguration mit Velacare Design-Tokens**

Ersetze `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: '#C96B3F',
          mid: '#D97E55',
          light: '#E8A07A',
          pale: '#FAF0E8',
          dark: '#9E4E28',
        },
        sage: {
          DEFAULT: '#2D7A5F',
          light: '#A8D5C2',
          pale: '#EAF5F0',
        },
        sky: { DEFAULT: '#185FA5', pale: '#E6F1FB' },
        amber: { DEFAULT: '#BA7517', pale: '#FAEEDA' },
        danger: { DEFAULT: '#A32D2D', pale: '#FCEBEB' },
        warm: {
          white: '#FDFAF7',
          gray: '#8A8078',
        },
        mid: { gray: '#C8BFB5' },
        dark: '#2C2420',
        bg: '#F5F0EB',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: globals.css mit Font-Imports und CSS-Reset**

Ersetze `src/styles/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; }

:root {
  --font-cormorant: 'Cormorant Garamond', Georgia, serif;
  --font-dm-sans: 'DM Sans', system-ui, sans-serif;
  --font-dm-mono: 'DM Mono', monospace;
}

html { scroll-behavior: smooth; }
body { background-color: #F5F0EB; color: #2C2420; }
```

- [ ] **Step 4: Root layout.tsx mit korrekten Font-Variablen**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'  // adjust path if needed: '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Velacare — Pflegehilfsmittel',
  description: 'Pflegehilfsmittel kostenlos über die Pflegekasse. Monatlich geliefert.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans bg-bg text-dark antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Typen-Datei anlegen**

Erstelle `src/lib/types.ts`:

```typescript
export type Pflegegrad = 1 | 2 | 3 | 4 | 5

export type ProduktKategorie =
  | 'Handschuhe'
  | 'Desinfektion'
  | 'Mundschutz'
  | 'Schutzkleidung'
  | 'Hygiene'
  | 'Sonstiges'

export interface Produkt {
  id: string
  name: string
  beschreibung: string
  preis: number          // in Euro, z.B. 8.50
  kategorie: ProduktKategorie
  aktiv: boolean
  bildUrl: string
  mengenOptionen?: string[]  // z.B. ['S', 'M', 'L'] für Handschuhe
}

export interface BoxProdukt {
  produkt: Produkt
  menge: string | null   // gewählte Größe/Menge, null wenn keine Optionen
}

export interface MockKunde {
  id: string
  vorname: string
  nachname: string
  email: string
  pflegegrad: Pflegegrad
  adresse: string
  krankenkasse: string
  lieferstichtag: number  // 1-28
  status: 'neu' | 'aktiv' | 'pausiert' | 'abgelehnt'
  box: BoxProdukt[]
}

export interface MockLieferung {
  id: string
  kundeId: string
  datum: string           // ISO date string
  status: 'geplant' | 'versendet' | 'geliefert' | 'pausiert'
  boxSnapshot: BoxProdukt[]
  gesamtwert: number
}

export interface MockAnfrage {
  id: string
  kundeId: string
  kategorie: 'Box-Inhalt' | 'Lieferung' | 'Adresse' | 'Sonstiges'
  nachricht: string
  status: 'offen' | 'beantwortet'
  antwort?: string
  erstelltAm: string
}
```

- [ ] **Step 6: Mock-Daten anlegen**

Erstelle `src/lib/mock-data.ts`:

```typescript
import type { Produkt, MockKunde, MockLieferung, MockAnfrage } from './types'

export const MOCK_PRODUKTE: Produkt[] = [
  {
    id: 'p1',
    name: 'Einmalhandschuhe latexfrei',
    beschreibung: '100 Stück, puderfrei, für empfindliche Haut geeignet',
    preis: 8.50,
    kategorie: 'Handschuhe',
    aktiv: true,
    bildUrl: '/mock/handschuhe.jpg',
    mengenOptionen: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'p2',
    name: 'Händedesinfektionsmittel',
    beschreibung: '500ml, VAH-gelistet, mit Pflegewirkstoffen',
    preis: 7.90,
    kategorie: 'Desinfektion',
    aktiv: true,
    bildUrl: '/mock/desinfektion.jpg',
  },
  {
    id: 'p3',
    name: 'FFP2-Masken',
    beschreibung: '10 Stück, CE-zertifiziert, bequeme Passform',
    preis: 9.50,
    kategorie: 'Mundschutz',
    aktiv: true,
    bildUrl: '/mock/masken.jpg',
  },
  {
    id: 'p4',
    name: 'Einmalschürzen',
    beschreibung: '100 Stück, reißfest, HDPE',
    preis: 6.80,
    kategorie: 'Schutzkleidung',
    aktiv: true,
    bildUrl: '/mock/schuerzen.jpg',
  },
  {
    id: 'p5',
    name: 'Pflegebetteinlagen',
    beschreibung: '30 Stück, saugstark, mit Klebestreifen',
    preis: 12.40,
    kategorie: 'Hygiene',
    aktiv: true,
    bildUrl: '/mock/betteinlagen.jpg',
  },
  {
    id: 'p6',
    name: 'Flächendesinfektion Spray',
    beschreibung: '750ml, schnell wirkend, für alle Oberflächen',
    preis: 8.90,
    kategorie: 'Desinfektion',
    aktiv: true,
    bildUrl: '/mock/flaechen.jpg',
  },
]

export const MOCK_KUNDEN: MockKunde[] = [
  {
    id: 'k1',
    vorname: 'Maria',
    nachname: 'Hoffmann',
    email: 'maria.hoffmann@example.de',
    pflegegrad: 2,
    adresse: 'Musterstraße 12, 80331 München',
    krankenkasse: 'AOK Bayern',
    lieferstichtag: 15,
    status: 'aktiv',
    box: [
      { produkt: MOCK_PRODUKTE[0], menge: 'M' },
      { produkt: MOCK_PRODUKTE[1], menge: null },
      { produkt: MOCK_PRODUKTE[4], menge: null },
    ],
  },
  {
    id: 'k2',
    vorname: 'Hans',
    nachname: 'Müller',
    email: 'hans.mueller@example.de',
    pflegegrad: 3,
    adresse: 'Berliner Allee 5, 40212 Düsseldorf',
    krankenkasse: 'Techniker Krankenkasse',
    lieferstichtag: 1,
    status: 'aktiv',
    box: [
      { produkt: MOCK_PRODUKTE[0], menge: 'L' },
      { produkt: MOCK_PRODUKTE[2], menge: null },
    ],
  },
  {
    id: 'k3',
    vorname: 'Ingrid',
    nachname: 'Weber',
    email: 'ingrid.weber@example.de',
    pflegegrad: 1,
    adresse: 'Gartenweg 3, 22111 Hamburg',
    krankenkasse: 'BARMER',
    lieferstichtag: 20,
    status: 'pausiert',
    box: [],
  },
]

export const MOCK_LIEFERUNGEN: MockLieferung[] = [
  {
    id: 'l1',
    kundeId: 'k1',
    datum: '2026-03-15',
    status: 'geliefert',
    boxSnapshot: MOCK_KUNDEN[0].box,
    gesamtwert: 28.80,
  },
  {
    id: 'l2',
    kundeId: 'k1',
    datum: '2026-04-15',
    status: 'geplant',
    boxSnapshot: MOCK_KUNDEN[0].box,
    gesamtwert: 28.80,
  },
  {
    id: 'l3',
    kundeId: 'k2',
    datum: '2026-04-01',
    status: 'geplant',
    boxSnapshot: MOCK_KUNDEN[1].box,
    gesamtwert: 18.00,
  },
]

export const MOCK_ANFRAGEN: MockAnfrage[] = [
  {
    id: 'a1',
    kundeId: 'k1',
    kategorie: 'Box-Inhalt',
    nachricht: 'Ich würde gerne die Handschuhgröße von M auf L ändern.',
    status: 'beantwortet',
    antwort: 'Gerne! Wir haben die Änderung für Ihre nächste Lieferung vorgemerkt.',
    erstelltAm: '2026-03-10',
  },
  {
    id: 'a2',
    kundeId: 'k2',
    kategorie: 'Lieferung',
    nachricht: 'Wann kommt meine nächste Lieferung?',
    status: 'offen',
    erstelltAm: '2026-03-18',
  },
]

export const MOCK_BUDGET_LIMIT = 42.00
```

- [ ] **Step 7: Mock-Store (React Context für Admin-CRUD) anlegen**

Erstelle `src/lib/mock-store.ts`:

```typescript
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { MOCK_PRODUKTE, MOCK_KUNDEN } from './mock-data'
import type { Produkt, MockKunde } from './types'

interface MockStoreState {
  produkte: Produkt[]
  kunden: MockKunde[]
  addProdukt: (p: Omit<Produkt, 'id'>) => void
  updateProdukt: (id: string, updates: Partial<Produkt>) => void
  deleteProdukt: (id: string) => void
  updateKunde: (id: string, updates: Partial<MockKunde>) => void
}

const MockStoreContext = createContext<MockStoreState | null>(null)

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [produkte, setProdukte] = useState<Produkt[]>(MOCK_PRODUKTE)
  const [kunden, setKunden] = useState<MockKunde[]>(MOCK_KUNDEN)

  const addProdukt = (p: Omit<Produkt, 'id'>) =>
    setProdukte(prev => [...prev, { ...p, id: `p${Date.now()}` }])

  const updateProdukt = (id: string, updates: Partial<Produkt>) =>
    setProdukte(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

  const deleteProdukt = (id: string) =>
    setProdukte(prev => prev.filter(p => p.id !== id))

  const updateKunde = (id: string, updates: Partial<MockKunde>) =>
    setKunden(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k))

  return (
    <MockStoreContext.Provider value={{ produkte, kunden, addProdukt, updateProdukt, deleteProdukt, updateKunde }}>
      {children}
    </MockStoreContext.Provider>
  )
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext)
  if (!ctx) throw new Error('useMockStore must be used within MockStoreProvider')
  return ctx
}
```

- [ ] **Step 8: UI-Basiskomponenten bauen**

Erstelle `src/components/ui/button.tsx`:

```typescript
import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'  // npm install clsx

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-terra text-warm-white hover:bg-terra-dark',
  secondary: 'bg-transparent border border-terra text-terra hover:bg-terra-pale',
  ghost: 'bg-transparent text-warm-gray hover:text-dark hover:bg-bg',
  danger: 'bg-danger-pale text-danger hover:bg-danger hover:text-white',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center px-5 py-2.5 rounded-md font-sans font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

Erstelle `src/components/ui/badge.tsx`:

```typescript
import { clsx } from 'clsx'

type BadgeVariant = 'terra' | 'sage' | 'sky' | 'amber' | 'danger' | 'gray'

const variants: Record<BadgeVariant, string> = {
  terra: 'bg-terra-pale text-terra',
  sage: 'bg-sage-pale text-sage',
  sky: 'bg-sky-pale text-sky',
  amber: 'bg-amber-pale text-amber',
  danger: 'bg-danger-pale text-danger',
  gray: 'bg-bg text-warm-gray',
}

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={clsx('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap', variants[variant], className)}>
      {children}
    </span>
  )
}
```

- [ ] **Step 9: Nav und Footer bauen**

Erstelle `src/components/layout/nav.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-white/95 backdrop-blur-sm border-b border-mid-gray h-14 flex items-center px-6 gap-8">
      <Link href="/" className="font-serif text-xl font-semibold text-dark flex-shrink-0">
        Velacare
        <span className="font-sans text-xs font-normal tracking-widest uppercase text-terra ml-2">
          Pflegehilfsmittel
        </span>
      </Link>
      <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-hide">
        <Link href="/wie-es-funktioniert" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Wie es funktioniert</Link>
        <Link href="/produkte" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Produkte</Link>
        <Link href="/faq" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">FAQ</Link>
        <Link href="/ueber-uns" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Über uns</Link>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/login" className="text-xs text-warm-gray hover:text-dark transition-colors">Anmelden</Link>
        <Button variant="primary" className="text-xs px-4 py-2">
          <Link href="/beantragen">Jetzt beantragen</Link>
        </Button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 10: Root-Layout aktualisieren**

Root-Layout um Nav + MockStoreProvider erweitern (`src/app/layout.tsx`):

```typescript
import type { Metadata } from 'next'
import '../styles/globals.css'
import { Nav } from '@/components/layout/nav'
import { MockStoreProvider } from '@/lib/mock-store'

export const metadata: Metadata = {
  title: 'Velacare — Pflegehilfsmittel',
  description: 'Pflegehilfsmittel kostenlos über die Pflegekasse. Monatlich geliefert.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans bg-bg text-dark antialiased">
        <MockStoreProvider>
          <Nav />
          <main className="pt-14">{children}</main>
        </MockStoreProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 11: Dev-Server starten und Basis prüfen**

```bash
npm run dev
```

Erwartung: App läuft auf http://localhost:3000, Nav sichtbar, Farben korrekt (Terrakotta, Hintergrund beige).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: project setup with Velacare design system and mock data"
```

---

## Task 2: Landing Page (`/`)

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/layout/footer.tsx`

- [ ] **Step 1: Footer bauen**

Erstelle `src/components/layout/footer.tsx`:

```typescript
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-dark text-warm-white/60 py-12 px-6 mt-20">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-serif text-lg font-semibold text-warm-white mb-1">Velacare</div>
          <div className="text-xs tracking-widest uppercase text-terra-light mb-4">Pflegehilfsmittel</div>
          <p className="text-xs leading-relaxed">Pflege, die jeden Monat ankommt.</p>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Service</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/wie-es-funktioniert" className="hover:text-terra-light transition-colors">Wie es funktioniert</Link></li>
            <li><Link href="/produkte" className="hover:text-terra-light transition-colors">Produkte</Link></li>
            <li><Link href="/beantragen" className="hover:text-terra-light transition-colors">Jetzt beantragen</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Über uns</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/ueber-uns" className="hover:text-terra-light transition-colors">Über Velacare</Link></li>
            <li><Link href="/faq" className="hover:text-terra-light transition-colors">FAQ</Link></li>
            <li><Link href="/kontakt" className="hover:text-terra-light transition-colors">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Rechtliches</div>
          <ul className="space-y-2 text-xs">
            <li><span className="opacity-50">Datenschutz</span></li>
            <li><span className="opacity-50">AGB</span></li>
            <li><span className="opacity-50">Impressum</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto border-t border-warm-white/10 mt-10 pt-6 text-xs text-center opacity-40">
        © 2026 Velacare · Alle Rechte vorbehalten
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Layout um Footer erweitern**

In `src/app/layout.tsx` Footer einbinden:

```typescript
import { Footer } from '@/components/layout/footer'
// ... in body:
// <Nav />
// <main className="pt-14">{children}</main>
// <Footer />
```

- [ ] **Step 3: Landing Page bauen**

Erstelle `src/app/page.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_PRODUKTE } from '@/lib/mock-data'

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-terra/5" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs tracking-[0.2em] uppercase text-terra-light mb-8">
            Pflegehilfsmittel · Kostenlos · Monatlich
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold text-warm-white leading-tight mb-4">
            Pflege, die jeden<br />Monat ankommt.
          </h1>
          <p className="text-warm-white/50 font-light text-lg max-w-xl mx-auto mb-10">
            Velacare liefert Ihnen monatlich kostenlose Pflegehilfsmittel — bezahlt von Ihrer Pflegekasse. Einfach beantragen, wir erledigen den Rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" className="text-base px-8 py-3">
              <Link href="/beantragen">Jetzt kostenlos beantragen</Link>
            </Button>
            <Button variant="secondary" className="text-base px-8 py-3 border-warm-white/20 text-warm-white/70 hover:bg-warm-white/5">
              <Link href="/wie-es-funktioniert">Wie es funktioniert</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Badge variant="terra">Pflegegrad 1–5</Badge>
            <Badge variant="sage">Bis 42 € monatlich</Badge>
            <Badge variant="gray" className="text-warm-white/40 bg-warm-white/5">Gesetzlich versichert</Badge>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">So einfach geht's</p>
        <h2 className="font-serif text-4xl font-semibold text-center mb-16">In 3 Schritten zur Box</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Anspruch prüfen', desc: 'Pflegegrad eingeben, fertig. Wir prüfen sofort ob Sie Anspruch haben — in weniger als 30 Sekunden.' },
            { num: '02', title: 'Box zusammenstellen', desc: 'Wählen Sie aus unserem Sortiment genau das, was Sie monatlich brauchen. Ihr Budget wird live angezeigt.' },
            { num: '03', title: 'Monatlich geliefert', desc: 'Wir kümmern uns um den Antrag bei Ihrer Pflegekasse. Sie erhalten Ihre Box pünktlich jeden Monat.' },
          ].map(step => (
            <div key={step.num} className="text-center">
              <div className="font-serif text-5xl font-semibold text-terra/20 mb-4">{step.num}</div>
              <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-warm-gray text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produkte-Teaser */}
      <section className="py-16 px-6 bg-warm-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-warm-gray mb-3">Aus unserem Sortiment</p>
          <h2 className="font-serif text-4xl font-semibold mb-12">Was in Ihrer Box sein kann</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_PRODUKTE.slice(0, 3).map(p => (
              <div key={p.id} className="bg-bg rounded-lg p-5 border border-mid-gray">
                <Badge variant="terra" className="mb-3">{p.kategorie}</Badge>
                <h4 className="font-medium text-sm mb-1">{p.name}</h4>
                <p className="text-xs text-warm-gray">{p.beschreibung}</p>
                <div className="mt-3 text-sm font-medium text-terra">{p.preis.toFixed(2).replace('.', ',')} €</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/produkte" className="text-sm text-terra hover:text-terra-dark underline underline-offset-4">
              Alle Produkte ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust-Sektion */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-semibold mb-4">Weil die wichtigsten Menschen<br />die beste Pflege verdienen.</h2>
        <p className="text-warm-gray max-w-xl mx-auto mb-10">Hinter jedem Auftrag steckt eine Familie. Velacare kommuniziert warm, persönlich und auf Augenhöhe.</p>
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Jetzt beantragen — kostenlos</Link>
        </Button>
      </section>
    </>
  )
}
```

- [ ] **Step 4: Im Browser prüfen**

Öffne http://localhost:3000 — erwartetes Ergebnis: dunkler Hero, 3-Schritte-Sektion, Produkte-Teaser, Trust-Sektion. Responsiv auf Mobilgröße prüfen (Browser DevTools).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: landing page with hero, steps, and product teaser"
```

---

## Task 3: Registrierungs-Funnel (`/beantragen`)

**Files:**
- Create: `src/app/beantragen/page.tsx`
- Create: `src/app/beantragen/step1-anspruch.tsx`
- Create: `src/app/beantragen/step2-daten.tsx`
- Create: `src/app/beantragen/step3-box.tsx`
- Create: `src/app/beantragen/step4-bestaetigung.tsx`
- Create: `src/app/beantragen/danke/page.tsx`
- Create: `src/components/funnel/fortschrittsbalken.tsx`
- Create: `src/components/box-konfigurator/budget-anzeige.tsx`
- Create: `src/components/box-konfigurator/produkt-karte.tsx`
- Create: `src/components/box-konfigurator/konfigurator.tsx`

- [ ] **Step 1: Fortschrittsbalken-Komponente**

Erstelle `src/components/funnel/fortschrittsbalken.tsx`:

```typescript
interface FortschrittsbalkenProps {
  aktuellerSchritt: number  // 1-4
  schritte: string[]
}

export function Fortschrittsbalken({ aktuellerSchritt, schritte }: FortschrittsbalkenProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto mb-10">
      {schritte.map((schritt, i) => {
        const nummer = i + 1
        const abgeschlossen = nummer < aktuellerSchritt
        const aktiv = nummer === aktuellerSchritt
        return (
          <div key={schritt} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                abgeschlossen ? 'bg-terra text-white' :
                aktiv ? 'bg-terra text-white ring-4 ring-terra-pale' :
                'bg-bg border-2 border-mid-gray text-warm-gray'
              }`}>
                {abgeschlossen ? '✓' : nummer}
              </div>
              <span className={`text-xs whitespace-nowrap ${aktiv ? 'text-dark font-medium' : 'text-warm-gray'}`}>
                {schritt}
              </span>
            </div>
            {i < schritte.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 ${abgeschlossen ? 'bg-terra' : 'bg-mid-gray'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Budget-Anzeige-Komponente**

Erstelle `src/components/box-konfigurator/budget-anzeige.tsx`:

```typescript
import { MOCK_BUDGET_LIMIT } from '@/lib/mock-data'

interface BudgetAnzeigeProps {
  genutzt: number
}

export function BudgetAnzeige({ genutzt }: BudgetAnzeigeProps) {
  const prozent = Math.min((genutzt / MOCK_BUDGET_LIMIT) * 100, 100)
  const ueberschritten = genutzt > MOCK_BUDGET_LIMIT
  const verbleibend = MOCK_BUDGET_LIMIT - genutzt

  return (
    <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">Budget</span>
        <span className={`text-sm font-medium ${ueberschritten ? 'text-danger' : 'text-dark'}`}>
          {genutzt.toFixed(2).replace('.', ',')} € / {MOCK_BUDGET_LIMIT.toFixed(2).replace('.', ',')} €
        </span>
      </div>
      <div className="w-full bg-bg rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${ueberschritten ? 'bg-danger' : 'bg-terra'}`}
          style={{ width: `${prozent}%` }}
        />
      </div>
      {ueberschritten ? (
        <p className="text-xs text-danger mt-2">Budget überschritten um {Math.abs(verbleibend).toFixed(2).replace('.', ',')} €</p>
      ) : (
        <p className="text-xs text-warm-gray mt-2">Noch {verbleibend.toFixed(2).replace('.', ',')} € verfügbar</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Produkt-Karte Komponente**

Erstelle `src/components/box-konfigurator/produkt-karte.tsx`:

```typescript
import type { Produkt, BoxProdukt } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface ProduktKarteProps {
  produkt: Produkt
  ausgewaehlt: boolean
  gewaehlteMenge: string | null
  budgetWuerdeUeberschritten: boolean
  onToggle: (produkt: Produkt, menge: string | null) => void
}

export function ProduktKarte({ produkt, ausgewaehlt, gewaehlteMenge, budgetWuerdeUeberschritten, onToggle }: ProduktKarteProps) {
  const deaktiviert = !ausgewaehlt && budgetWuerdeUeberschritten

  return (
    <div className={`rounded-lg border bg-warm-white transition-all ${
      ausgewaehlt ? 'border-terra ring-2 ring-terra-pale' :
      deaktiviert ? 'border-mid-gray opacity-50' :
      'border-mid-gray hover:border-terra-light'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="terra">{produkt.kategorie}</Badge>
          <span className="text-sm font-medium text-terra">{produkt.preis.toFixed(2).replace('.', ',')} €</span>
        </div>
        <h4 className="font-medium text-sm text-dark mb-1">{produkt.name}</h4>
        <p className="text-xs text-warm-gray leading-relaxed mb-3">{produkt.beschreibung}</p>

        {produkt.mengenOptionen && ausgewaehlt && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {produkt.mengenOptionen.map(opt => (
              <button
                key={opt}
                onClick={() => onToggle(produkt, opt)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  gewaehlteMenge === opt
                    ? 'bg-terra text-white border-terra'
                    : 'border-mid-gray text-warm-gray hover:border-terra'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onToggle(produkt, produkt.mengenOptionen?.[1] ?? null)}
          disabled={deaktiviert}
          className={`w-full py-2 text-xs font-medium rounded-md transition-colors ${
            ausgewaehlt
              ? 'bg-terra text-white hover:bg-terra-dark'
              : deaktiviert
                ? 'bg-bg text-warm-gray cursor-not-allowed'
                : 'bg-terra-pale text-terra hover:bg-terra hover:text-white'
          }`}
        >
          {ausgewaehlt ? '✓ Ausgewählt — Entfernen' : deaktiviert ? 'Budget reicht nicht' : 'Zur Box hinzufügen'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Konfigurator-Hauptkomponente**

Erstelle `src/components/box-konfigurator/konfigurator.tsx`:

```typescript
'use client'

import { useState } from 'react'
import type { Produkt, BoxProdukt, ProduktKategorie } from '@/lib/types'
import { MOCK_BUDGET_LIMIT } from '@/lib/mock-data'
import { ProduktKarte } from './produkt-karte'
import { BudgetAnzeige } from './budget-anzeige'
import { Button } from '@/components/ui/button'

const KATEGORIEN: (ProduktKategorie | 'Alle')[] = ['Alle', 'Handschuhe', 'Desinfektion', 'Mundschutz', 'Schutzkleidung', 'Hygiene', 'Sonstiges']

interface KonfiguratorProps {
  produkte: Produkt[]
  initialBox?: BoxProdukt[]
  onSave: (box: BoxProdukt[]) => void
  saveLabel?: string
}

export function Konfigurator({ produkte, initialBox = [], onSave, saveLabel = 'Box speichern' }: KonfiguratorProps) {
  const [box, setBox] = useState<BoxProdukt[]>(initialBox)
  const [kategorie, setKategorie] = useState<ProduktKategorie | 'Alle'>('Alle')

  const gesamtwert = box.reduce((sum, item) => sum + item.produkt.preis, 0)

  const toggleProdukt = (produkt: Produkt, menge: string | null) => {
    const istDrin = box.some(b => b.produkt.id === produkt.id)
    if (istDrin) {
      if (menge !== null) {
        // Menge ändern
        setBox(prev => prev.map(b => b.produkt.id === produkt.id ? { ...b, menge } : b))
      } else {
        setBox(prev => prev.filter(b => b.produkt.id !== produkt.id))
      }
    } else {
      setBox(prev => [...prev, { produkt, menge }])
    }
  }

  const gefiltert = kategorie === 'Alle' ? produkte : produkte.filter(p => p.kategorie === kategorie)
  const ueberschritten = gesamtwert > MOCK_BUDGET_LIMIT

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar */}
      <div className="space-y-4">
        <BudgetAnzeige genutzt={gesamtwert} />

        {/* Kategorie-Filter */}
        <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Kategorie</p>
          <div className="flex flex-wrap gap-1">
            {KATEGORIEN.map(k => (
              <button
                key={k}
                onClick={() => setKategorie(k)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  kategorie === k ? 'bg-terra text-white' : 'bg-bg text-warm-gray hover:bg-terra-pale hover:text-terra'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Gewählte Produkte */}
        {box.length > 0 && (
          <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ihre Auswahl</p>
            <div className="space-y-2">
              {box.map(item => (
                <div key={item.produkt.id} className="flex justify-between items-center text-xs">
                  <span className="text-dark">{item.produkt.name}{item.menge ? ` (${item.menge})` : ''}</span>
                  <span className="text-terra font-medium">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={ueberschritten || box.length === 0}
          onClick={() => onSave(box)}
        >
          {saveLabel}
        </Button>
      </div>

      {/* Produkt-Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gefiltert.map(produkt => {
          const boxItem = box.find(b => b.produkt.id === produkt.id)
          const ausgewaehlt = !!boxItem
          const budgetNachHinzufuegen = gesamtwert + (ausgewaehlt ? 0 : produkt.preis)
          return (
            <ProduktKarte
              key={produkt.id}
              produkt={produkt}
              ausgewaehlt={ausgewaehlt}
              gewaehlteMenge={boxItem?.menge ?? null}
              budgetWuerdeUeberschritten={budgetNachHinzufuegen > MOCK_BUDGET_LIMIT}
              onToggle={toggleProdukt}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Funnel-Schritte 1 und 2 bauen**

Erstelle `src/app/beantragen/step1-anspruch.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Pflegegrad } from '@/lib/types'

interface Step1Props {
  onWeiter: (data: { pflegegrad: Pflegegrad; zuhause: boolean; gesetzlichVersichert: boolean }) => void
}

export function Step1Anspruch({ onWeiter }: Step1Props) {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad | null>(null)
  const [zuhause, setZuhause] = useState<boolean | null>(null)
  const [gesetzlich, setGesetzlich] = useState<boolean | null>(null)

  const hatAnspruch = pflegegrad !== null && zuhause === true && gesetzlich === true
  const keinAnspruch = (zuhause === false || gesetzlich === false)

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Pflegegrad</p>
        <div className="flex gap-2 flex-wrap">
          {([1, 2, 3, 4, 5] as Pflegegrad[]).map(pg => (
            <button
              key={pg}
              onClick={() => setPflegegrad(pg)}
              className={`w-14 h-14 rounded-lg border-2 font-serif text-xl font-semibold transition-all ${
                pflegegrad === pg ? 'border-terra bg-terra text-white' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {pg}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Pflegeort</p>
        <div className="flex gap-3">
          {[{ val: true, label: 'Zuhause (häusliche Pflege)' }, { val: false, label: 'Pflegeheim / stationär' }].map(o => (
            <button
              key={String(o.val)}
              onClick={() => setZuhause(o.val)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                zuhause === o.val ? 'border-terra bg-terra-pale text-terra' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Krankenversicherung</p>
        <div className="flex gap-3">
          {[{ val: true, label: 'Gesetzlich versichert' }, { val: false, label: 'Privat versichert' }].map(o => (
            <button
              key={String(o.val)}
              onClick={() => setGesetzlich(o.val)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm transition-all ${
                gesetzlich === o.val ? 'border-terra bg-terra-pale text-terra' : 'border-mid-gray text-dark hover:border-terra'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {hatAnspruch && (
        <div className="bg-sage-pale border border-sage-light rounded-lg p-4">
          <p className="text-sage font-medium text-sm">✓ Sie haben Anspruch auf bis zu 42 € monatlich!</p>
          <p className="text-sage/70 text-xs mt-1">Ihre Pflegekasse übernimmt die Kosten vollständig.</p>
        </div>
      )}

      {keinAnspruch && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">Leider kein Anspruch in Ihrer Situation.</p>
          <p className="text-amber/70 text-xs mt-1">Die Pflegehilfsmittel gemäß § 40 SGB XI sind nur für häusliche Pflege mit gesetzlicher Krankenversicherung.</p>
        </div>
      )}

      <Button
        variant="primary"
        disabled={!hatAnspruch}
        onClick={() => hatAnspruch && onWeiter({ pflegegrad: pflegegrad!, zuhause: true, gesetzlichVersichert: true })}
        className="w-full"
      >
        Weiter →
      </Button>
    </div>
  )
}
```

Erstelle `src/app/beantragen/step2-daten.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

const schema = z.object({
  vorname: z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname: z.string().min(2, 'Mindestens 2 Zeichen'),
  geburtsdatum: z.string().min(1, 'Pflichtfeld'),
  strasse: z.string().min(3, 'Pflichtfeld'),
  plz: z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
  ort: z.string().min(2, 'Pflichtfeld'),
  krankenkasse: z.string().min(2, 'Pflichtfeld'),
  telefon: z.string().min(6, 'Pflichtfeld'),
  email: z.string().email('Gültige E-Mail-Adresse'),
  passwort: z.string().min(8, 'Mindestens 8 Zeichen'),
})

type FormData = z.infer<typeof schema>
type Errors = Partial<Record<keyof FormData, string>>

interface Step2Props {
  onWeiter: (data: FormData) => void
  onZurueck: () => void
}

export function Step2Daten({ onWeiter, onZurueck }: Step2Props) {
  const [form, setForm] = useState<Partial<FormData>>({})
  const [errors, setErrors] = useState<Errors>({})

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleWeiter = () => {
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Errors = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onWeiter(result.data)
  }

  const field = (name: keyof FormData, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-dark mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[name] as string) ?? ''}
        onChange={set(name)}
        className={`w-full px-3 py-2 rounded-md border text-sm bg-warm-white focus:outline-none focus:ring-2 focus:ring-terra/30 ${
          errors[name] ? 'border-danger' : 'border-mid-gray'
        }`}
      />
      {errors[name] && <p className="text-xs text-danger mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Pflegebedürftige Person</p>
        <div className="grid grid-cols-2 gap-4">
          {field('vorname', 'Vorname')}
          {field('nachname', 'Nachname')}
        </div>
        <div className="mt-4 space-y-4">
          {field('geburtsdatum', 'Geburtsdatum', 'date')}
          {field('strasse', 'Straße & Hausnummer', 'text', 'Musterstraße 1')}
          <div className="grid grid-cols-2 gap-4">
            {field('plz', 'PLZ', 'text', '80331')}
            {field('ort', 'Ort', 'text', 'München')}
          </div>
          {field('krankenkasse', 'Krankenkasse', 'text', 'z.B. AOK Bayern')}
          {field('telefon', 'Telefon', 'tel', '+49 89 12345678')}
        </div>
      </div>

      <div className="border-t border-mid-gray pt-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Konto erstellen</p>
        <div className="space-y-4">
          {field('email', 'E-Mail-Adresse', 'email', 'ihre@email.de')}
          {field('passwort', 'Passwort', 'password', 'Mindestens 8 Zeichen')}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
        <Button variant="primary" className="flex-1" onClick={handleWeiter}>Weiter →</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Funnel-Schritte 3 und 4 bauen**

Erstelle `src/app/beantragen/step3-box.tsx`:

```typescript
'use client'

import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { Button } from '@/components/ui/button'
import { MOCK_PRODUKTE } from '@/lib/mock-data'
import type { BoxProdukt } from '@/lib/types'

interface Step3Props {
  onWeiter: (box: BoxProdukt[]) => void
  onZurueck: () => void
}

export function Step3Box({ onWeiter, onZurueck }: Step3Props) {
  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" onClick={onZurueck} className="mb-4">← Zurück</Button>
        <p className="text-warm-gray text-sm max-w-xl">Stellen Sie jetzt Ihre persönliche Box zusammen. Ihr Budget von 42 € wird live aktualisiert.</p>
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        onSave={onWeiter}
        saveLabel="Box bestätigen →"
      />
    </div>
  )
}
```

Erstelle `src/app/beantragen/step4-bestaetigung.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { BoxProdukt } from '@/lib/types'

interface Step4Props {
  box: BoxProdukt[]
  onBestaetigen: (stichtag: number) => void
  onZurueck: () => void
}

export function Step4Bestaetigung({ box, onBestaetigen, onZurueck }: Step4Props) {
  const [stichtag, setStichtag] = useState<number>(15)
  const [dsgvo, setDsgvo] = useState(false)
  const [agb, setAgb] = useState(false)

  const gesamtwert = box.reduce((sum, item) => sum + item.produkt.preis, 0)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Box-Zusammenfassung */}
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ihre Box</p>
        <div className="space-y-2">
          {box.map(item => (
            <div key={item.produkt.id} className="flex justify-between text-sm">
              <span>{item.produkt.name}{item.menge ? ` (${item.menge})` : ''}</span>
              <span className="text-terra font-medium">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
            </div>
          ))}
          <div className="border-t border-mid-gray pt-2 flex justify-between font-medium">
            <span>Gesamt</span>
            <span className="text-terra">{gesamtwert.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>
      </div>

      {/* Lieferstichtag */}
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Wunsch-Lieferstichtag</p>
        <select
          value={stichtag}
          onChange={e => setStichtag(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-md border border-mid-gray bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-terra/30"
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map(tag => (
            <option key={tag} value={tag}>{tag}. des Monats</option>
          ))}
        </select>
      </div>

      {/* Checkboxen */}
      <div className="space-y-3">
        {[
          { state: dsgvo, set: setDsgvo, label: 'Ich stimme der Datenschutzerklärung zu.' },
          { state: agb, set: setAgb, label: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.' },
        ].map(({ state, set, label }) => (
          <label key={label} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state}
              onChange={e => set(e.target.checked)}
              className="mt-0.5 accent-terra"
            />
            <span className="text-sm text-warm-gray">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onZurueck}>← Zurück</Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!dsgvo || !agb || box.length === 0}
          onClick={() => onBestaetigen(stichtag)}
        >
          Antrag absenden
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Funnel-Container und Danke-Seite bauen**

Erstelle `src/app/beantragen/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fortschrittsbalken } from '@/components/funnel/fortschrittsbalken'
import { Step1Anspruch } from './step1-anspruch'
import { Step2Daten } from './step2-daten'
import { Step3Box } from './step3-box'
import { Step4Bestaetigung } from './step4-bestaetigung'
import type { BoxProdukt, Pflegegrad } from '@/lib/types'

const SCHRITTE = ['Anspruch', 'Ihre Daten', 'Box wählen', 'Bestätigung']

export default function BeantragenPage() {
  const router = useRouter()
  const [schritt, setSchritt] = useState(1)
  const [box, setBox] = useState<BoxProdukt[]>([])

  return (
    <div className="min-h-screen bg-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-semibold mb-2">Pflegebox beantragen</h1>
          <p className="text-warm-gray text-sm">Kostenlos, dauert nur 3 Minuten.</p>
        </div>
        <Fortschrittsbalken aktuellerSchritt={schritt} schritte={SCHRITTE} />

        {schritt === 1 && <Step1Anspruch onWeiter={() => setSchritt(2)} />}
        {schritt === 2 && <Step2Daten onWeiter={() => setSchritt(3)} onZurueck={() => setSchritt(1)} />}
        {schritt === 3 && <Step3Box onWeiter={(b) => { setBox(b); setSchritt(4) }} onZurueck={() => setSchritt(2)} />}
        {schritt === 4 && <Step4Bestaetigung box={box} onBestaetigen={() => router.push('/beantragen/danke')} onZurueck={() => setSchritt(3)} />}
      </div>
    </div>
  )
}
```

Erstelle `src/app/beantragen/danke/page.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DankePage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-sage-pale rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h1 className="font-serif text-4xl font-semibold mb-4">Antrag eingegangen!</h1>
        <p className="text-warm-gray leading-relaxed mb-8">
          Vielen Dank für Ihre Anfrage. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Unser Team meldet sich in Kürze bei Ihnen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">
            <Link href="/konto">Zum Kundenkonto</Link>
          </Button>
          <Button variant="secondary">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Im Browser durchklicken**

Navigiere zu http://localhost:3000/beantragen und klicke alle 4 Schritte durch.
Prüfe: Budget-Counter aktualisiert sich live, disabled-States greifen, Danke-Seite erreichbar.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: registration funnel with 4 steps and box configurator"
```

---

## Task 4: Kundenportal (`/konto`)

**Files:**
- Create: `src/app/konto/layout.tsx`
- Create: `src/app/konto/page.tsx`
- Create: `src/app/konto/meine-box/page.tsx`
- Create: `src/app/konto/lieferungen/page.tsx`
- Create: `src/app/konto/einstellungen/page.tsx`
- Create: `src/app/konto/anfragen/page.tsx`
- Create: `src/components/layout/konto-sidebar.tsx`

- [ ] **Step 1: Konto-Sidebar**

Erstelle `src/components/layout/konto-sidebar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/konto', label: 'Dashboard', icon: '🏠' },
  { href: '/konto/meine-box', label: 'Meine Box', icon: '📦' },
  { href: '/konto/lieferungen', label: 'Lieferungen', icon: '🚚' },
  { href: '/konto/anfragen', label: 'Anfragen', icon: '💬' },
  { href: '/konto/einstellungen', label: 'Einstellungen', icon: '⚙️' },
]

export function KontoSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0">
      <nav className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 text-sm border-b border-mid-gray last:border-none transition-colors',
              pathname === link.href ? 'bg-terra-pale text-terra font-medium' : 'text-warm-gray hover:bg-bg hover:text-dark'
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Konto-Layout**

Erstelle `src/app/konto/layout.tsx`:

```typescript
import { KontoSidebar } from '@/components/layout/konto-sidebar'

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex gap-6 items-start">
        <KontoSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Dashboard**

Erstelle `src/app/konto/page.tsx`:

```typescript
import { MOCK_KUNDEN, MOCK_LIEFERUNGEN, MOCK_ANFRAGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

const MOCK_KUNDE = MOCK_KUNDEN[0]  // Eingeloggter Mock-Nutzer

export default function KontoDashboard() {
  const naechste = MOCK_LIEFERUNGEN.find(l => l.kundeId === MOCK_KUNDE.id && l.status === 'geplant')
  const letzteAnfragen = MOCK_ANFRAGEN.filter(a => a.kundeId === MOCK_KUNDE.id && a.status === 'offen')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Guten Tag, {MOCK_KUNDE.vorname}!</h1>
        <p className="text-warm-gray text-sm">Pflegegrad {MOCK_KUNDE.pflegegrad} · {MOCK_KUNDE.krankenkasse}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Aktuelle Box */}
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Aktuelle Box</p>
          {MOCK_KUNDE.box.length > 0 ? (
            <>
              <div className="space-y-1 mb-3">
                {MOCK_KUNDE.box.map(item => (
                  <div key={item.produkt.id} className="text-sm text-dark">{item.produkt.name}</div>
                ))}
              </div>
              <p className="text-xs text-warm-gray">{MOCK_KUNDE.box.reduce((s, i) => s + i.produkt.preis, 0).toFixed(2).replace('.', ',')} € Gesamtwert</p>
            </>
          ) : (
            <p className="text-sm text-warm-gray">Noch keine Box konfiguriert.</p>
          )}
        </div>

        {/* Nächste Lieferung */}
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Nächste Lieferung</p>
          {naechste ? (
            <>
              <p className="text-2xl font-serif font-semibold mb-1">{naechste.datum}</p>
              <Badge variant="sage">Geplant</Badge>
              <p className="text-xs text-warm-gray mt-2">Stichtag: {MOCK_KUNDE.lieferstichtag}. des Monats</p>
            </>
          ) : (
            <Badge variant="amber">Pausiert</Badge>
          )}
        </div>
      </div>

      {letzteAnfragen.length > 0 && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">💬 {letzteAnfragen.length} offene Anfrage(n)</p>
          <p className="text-amber/70 text-xs mt-1">Prüfen Sie Ihre Anfragen unter „Anfragen".</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Meine Box (Konfigurator im Konto)**

Erstelle `src/app/konto/meine-box/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { MOCK_PRODUKTE, MOCK_KUNDEN } from '@/lib/mock-data'
import type { BoxProdukt } from '@/lib/types'

export default function MeineBoxPage() {
  const [gespeichert, setGespeichert] = useState(false)

  const handleSave = (box: BoxProdukt[]) => {
    setGespeichert(true)
    setTimeout(() => setGespeichert(false), 3000)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Meine Box</h1>
          <p className="text-warm-gray text-sm">Änderungen gelten ab der nächsten Lieferung.</p>
        </div>
        {gespeichert && (
          <div className="bg-sage-pale text-sage text-sm px-4 py-2 rounded-lg border border-sage-light">
            ✓ Gespeichert
          </div>
        )}
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        initialBox={MOCK_KUNDEN[0].box}
        onSave={handleSave}
        saveLabel="Änderungen speichern"
      />
    </div>
  )
}
```

- [ ] **Step 5: Lieferungen, Anfragen, Einstellungen**

Erstelle `src/app/konto/lieferungen/page.tsx`:

```typescript
import { MOCK_LIEFERUNGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

const STATUS_MAP = { geplant: 'amber', versendet: 'sky', geliefert: 'sage', pausiert: 'gray' } as const

export default function LieferungenPage() {
  const lieferungen = MOCK_LIEFERUNGEN.filter(l => l.kundeId === MOCK_KUNDEN[0].id)
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      <div className="space-y-3">
        {lieferungen.map(l => (
          <div key={l.id} className="bg-warm-white rounded-lg border border-mid-gray p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{l.datum}</p>
              <p className="text-xs text-warm-gray">{l.boxSnapshot.length} Produkte · {l.gesamtwert.toFixed(2).replace('.', ',')} €</p>
            </div>
            <Badge variant={STATUS_MAP[l.status]}>{l.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Erstelle `src/app/konto/anfragen/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { MOCK_ANFRAGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const KATEGORIEN = ['Box-Inhalt', 'Lieferung', 'Adresse', 'Sonstiges'] as const

export default function AnfragenPage() {
  const anfragen = MOCK_ANFRAGEN.filter(a => a.kundeId === MOCK_KUNDEN[0].id)
  const [nachricht, setNachricht] = useState('')
  const [kat, setKat] = useState<typeof KATEGORIEN[number]>('Sonstiges')
  const [gesendet, setGesendet] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Anfragen</h1>

      {/* Neue Anfrage */}
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Neue Anfrage</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {KATEGORIEN.map(k => (
            <button key={k} onClick={() => setKat(k)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${kat === k ? 'bg-terra text-white border-terra' : 'border-mid-gray text-warm-gray hover:border-terra'}`}>
              {k}
            </button>
          ))}
        </div>
        <textarea
          value={nachricht}
          onChange={e => setNachricht(e.target.value)}
          placeholder="Ihre Nachricht an Velacare..."
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
        />
        {gesendet && <p className="text-sage text-xs mt-2">✓ Anfrage gesendet</p>}
        <Button variant="primary" className="mt-3" onClick={() => { setGesendet(true); setNachricht('') }}
          disabled={nachricht.trim().length < 5}>
          Anfrage senden
        </Button>
      </div>

      {/* Bisherige Anfragen */}
      <div className="space-y-3">
        {anfragen.map(a => (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="terra">{a.kategorie}</Badge>
              <Badge variant={a.status === 'offen' ? 'amber' : 'sage'}>{a.status}</Badge>
            </div>
            <p className="text-sm mb-2">{a.nachricht}</p>
            {a.antwort && (
              <div className="bg-sage-pale rounded p-3 text-xs text-sage">
                <strong>Velacare:</strong> {a.antwort}
              </div>
            )}
            <p className="text-xs text-warm-gray mt-2">{a.erstelltAm}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Erstelle `src/app/konto/einstellungen/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { MOCK_KUNDEN } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

const KUNDE = MOCK_KUNDEN[0]

export default function EinstellungenPage() {
  const [loeschDialog, setLoeschDialog] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Einstellungen</h1>

      {/* Kontaktdaten */}
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Kontaktdaten</p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-warm-gray">Name:</span><br />{KUNDE.vorname} {KUNDE.nachname}</div>
          <div><span className="text-warm-gray">E-Mail:</span><br />{KUNDE.email}</div>
          <div><span className="text-warm-gray">Adresse:</span><br />{KUNDE.adresse}</div>
          <div><span className="text-warm-gray">Krankenkasse:</span><br />{KUNDE.krankenkasse}</div>
        </div>
        <Button variant="secondary" className="text-xs">Daten ändern (Demo)</Button>
      </div>

      {/* Passwort */}
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Passwort</p>
        <Button variant="secondary" className="text-xs">Passwort ändern (Demo)</Button>
      </div>

      {/* Account löschen */}
      <div className="bg-danger-pale rounded-lg border border-danger/20 p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-danger mb-2">Gefahrenzone</p>
        <p className="text-sm text-warm-gray mb-4">Ihr Account und alle Daten werden innerhalb von 30 Tagen gelöscht (DSGVO).</p>
        {!loeschDialog ? (
          <Button variant="danger" onClick={() => setLoeschDialog(true)}>Account löschen</Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-danger">Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setLoeschDialog(false)}>Abbrechen</Button>
              <Button variant="danger">Ja, Account löschen (Demo)</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Alle Konto-Seiten im Browser prüfen**

Navigiere durch `/konto`, `/konto/meine-box`, `/konto/lieferungen`, `/konto/anfragen`, `/konto/einstellungen`.
Prüfe: Sidebar-Navigation korrekt aktiv, Box-Konfigurator funktioniert, Toast nach Speichern.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: customer portal with dashboard, box configurator, and settings"
```

---

## Task 5: Admin-Panel (`/admin`)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/kunden/page.tsx`
- Create: `src/app/admin/kunden/[id]/page.tsx`
- Create: `src/app/admin/produkte/page.tsx`
- Create: `src/app/admin/lieferungen/page.tsx`
- Create: `src/app/admin/anfragen/page.tsx`
- Create: `src/components/layout/admin-sidebar.tsx`

- [ ] **Step 1: Admin-Sidebar**

Erstelle `src/components/layout/admin-sidebar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/kunden', label: 'Kunden', icon: '👥' },
  { href: '/admin/produkte', label: 'Produkte', icon: '📦' },
  { href: '/admin/lieferungen', label: 'Lieferungen', icon: '🚚' },
  { href: '/admin/anfragen', label: 'Anfragen', icon: '💬' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-dark rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-white/10">
          <p className="font-serif text-warm-white text-sm font-semibold">Velacare Admin</p>
          <p className="text-xs text-warm-white/40 mt-0.5">Internes Panel</p>
        </div>
        <nav>
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 text-sm border-b border-warm-white/5 last:border-none transition-colors',
                pathname === link.href ? 'bg-terra/20 text-terra-light' : 'text-warm-white/50 hover:bg-warm-white/5 hover:text-warm-white'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Admin-Layout**

Erstelle `src/app/admin/layout.tsx`:

```typescript
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex gap-6 items-start">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Admin-Dashboard**

Erstelle `src/app/admin/page.tsx`:

```typescript
import { MOCK_KUNDEN, MOCK_LIEFERUNGEN, MOCK_ANFRAGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function AdminDashboard() {
  const offeneAnfragen = MOCK_ANFRAGEN.filter(a => a.status === 'offen')
  const aktiveKunden = MOCK_KUNDEN.filter(k => k.status === 'aktiv')
  const geplanteL = MOCK_LIEFERUNGEN.filter(l => l.status === 'geplant')

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktive Kunden', wert: aktiveKunden.length, farbe: 'text-terra' },
          { label: 'Geplante Lieferungen', wert: geplanteL.length, farbe: 'text-sky' },
          { label: 'Offene Anfragen', wert: offeneAnfragen.length, farbe: 'text-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">{kpi.label}</p>
            <p className={`font-serif text-4xl font-semibold ${kpi.farbe}`}>{kpi.wert}</p>
          </div>
        ))}
      </div>

      {/* Neueste Kunden */}
      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray flex justify-between items-center">
          <p className="text-sm font-medium">Neueste Kunden</p>
          <Link href="/admin/kunden" className="text-xs text-terra hover:underline">Alle ansehen →</Link>
        </div>
        {MOCK_KUNDEN.map(k => (
          <Link key={k.id} href={`/admin/kunden/${k.id}`}
            className="flex items-center justify-between px-5 py-3 border-b border-mid-gray last:border-none hover:bg-bg transition-colors">
            <div>
              <p className="text-sm font-medium">{k.vorname} {k.nachname}</p>
              <p className="text-xs text-warm-gray">{k.email} · PG {k.pflegegrad}</p>
            </div>
            <Badge variant={k.status === 'aktiv' ? 'sage' : k.status === 'pausiert' ? 'amber' : 'gray'}>{k.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Kundenliste und Kundendetail**

Erstelle `src/app/admin/kunden/page.tsx`:

```typescript
import Link from 'next/link'
import { MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export default function KundenListePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Kunden</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-mid-gray">
            <tr>
              {['Name', 'E-Mail', 'Pflegegrad', 'Krankenkasse', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium tracking-widest uppercase text-warm-gray">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_KUNDEN.map(k => (
              <tr key={k.id} className="border-b border-mid-gray last:border-none hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium">{k.vorname} {k.nachname}</td>
                <td className="px-4 py-3 text-warm-gray">{k.email}</td>
                <td className="px-4 py-3">PG {k.pflegegrad}</td>
                <td className="px-4 py-3 text-warm-gray">{k.krankenkasse}</td>
                <td className="px-4 py-3">
                  <Badge variant={k.status === 'aktiv' ? 'sage' : k.status === 'pausiert' ? 'amber' : 'gray'}>{k.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/kunden/${k.id}`} className="text-terra text-xs hover:underline">Detail →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

Erstelle `src/app/admin/kunden/[id]/page.tsx`:

```typescript
import { MOCK_KUNDEN, MOCK_LIEFERUNGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function KundenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kunde = MOCK_KUNDEN.find(k => k.id === id)
  if (!kunde) notFound()

  const lieferungen = MOCK_LIEFERUNGEN.filter(l => l.kundeId === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kunden" className="text-xs text-warm-gray hover:text-dark">← Zurück</Link>
        <h1 className="font-serif text-3xl font-semibold">{kunde.vorname} {kunde.nachname}</h1>
        <Badge variant={kunde.status === 'aktiv' ? 'sage' : 'amber'}>{kunde.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Stammdaten</p>
          <dl className="space-y-2 text-sm">
            {[['E-Mail', kunde.email], ['Pflegegrad', `PG ${kunde.pflegegrad}`], ['Adresse', kunde.adresse], ['Krankenkasse', kunde.krankenkasse], ['Lieferstichtag', `${kunde.lieferstichtag}. des Monats`]].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="text-warm-gray w-28 flex-shrink-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Aktuelle Box</p>
          {kunde.box.length > 0 ? (
            <div className="space-y-1">
              {kunde.box.map(item => (
                <div key={item.produkt.id} className="flex justify-between text-sm">
                  <span>{item.produkt.name}</span>
                  <span className="text-terra">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-warm-gray">Keine Box konfiguriert.</p>}
        </div>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray">
          <p className="text-sm font-medium">Lieferungen</p>
        </div>
        {lieferungen.map(l => (
          <div key={l.id} className="flex justify-between items-center px-5 py-3 border-b border-mid-gray last:border-none">
            <span className="text-sm">{l.datum}</span>
            <span className="text-sm text-warm-gray">{l.gesamtwert.toFixed(2).replace('.', ',')} €</span>
            <Badge variant={l.status === 'geliefert' ? 'sage' : 'amber'}>{l.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Produkte (CRUD mit Mock-Store)**

Erstelle `src/app/admin/produkte/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useMockStore } from '@/lib/mock-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Produkt } from '@/lib/types'

export default function ProdukteAdminPage() {
  const { produkte, updateProdukt, deleteProdukt, addProdukt } = useMockStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [neuerName, setNeuerName] = useState('')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-semibold">Produkte</h1>
        <Button variant="primary" className="text-xs" onClick={() => addProdukt({
          name: 'Neues Produkt',
          beschreibung: 'Beschreibung',
          preis: 5.00,
          kategorie: 'Sonstiges',
          aktiv: true,
          bildUrl: '',
        })}>
          + Produkt hinzufügen
        </Button>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {produkte.map(p => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none">
            <div className="flex-1">
              {editId === p.id ? (
                <input
                  className="border border-terra rounded px-2 py-1 text-sm w-full max-w-xs"
                  value={neuerName}
                  onChange={e => setNeuerName(e.target.value)}
                  onBlur={() => { updateProdukt(p.id, { name: neuerName }); setEditId(null) }}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium">{p.name}</p>
              )}
              <p className="text-xs text-warm-gray">{p.kategorie} · {p.preis.toFixed(2).replace('.', ',')} €</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.aktiv ? 'sage' : 'gray'}>{p.aktiv ? 'Aktiv' : 'Deaktiviert'}</Badge>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditId(p.id); setNeuerName(p.name) }}>Bearbeiten</Button>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => updateProdukt(p.id, { aktiv: !p.aktiv })}>
                {p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
              </Button>
              <Button variant="danger" className="text-xs px-2 py-1" onClick={() => deleteProdukt(p.id)}>Löschen</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Lieferungen und Anfragen (Admin)**

Erstelle `src/app/admin/lieferungen/page.tsx`:

```typescript
import { MOCK_LIEFERUNGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export default function LieferungenAdminPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {MOCK_LIEFERUNGEN.map(l => {
          const kunde = MOCK_KUNDEN.find(k => k.id === l.kundeId)
          return (
            <div key={l.id} className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none">
              <div>
                <p className="text-sm font-medium">{kunde?.vorname} {kunde?.nachname}</p>
                <p className="text-xs text-warm-gray">{l.datum} · {l.gesamtwert.toFixed(2).replace('.', ',')} € · {l.boxSnapshot.length} Produkte</p>
              </div>
              <Badge variant={l.status === 'geliefert' ? 'sage' : l.status === 'geplant' ? 'amber' : 'sky'}>{l.status}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Erstelle `src/app/admin/anfragen/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { MOCK_ANFRAGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AnfragenAdminPage() {
  const [antworten, setAntworten] = useState<Record<string, string>>({})
  const [beantwortet, setBeantwortet] = useState<Set<string>>(new Set())

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Anfragen</h1>
      <div className="space-y-4">
        {MOCK_ANFRAGEN.map(a => {
          const kunde = MOCK_KUNDEN.find(k => k.id === a.kundeId)
          const istBeantwortet = beantwortet.has(a.id) || a.status === 'beantwortet'
          return (
            <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium">{kunde?.vorname} {kunde?.nachname}</p>
                  <p className="text-xs text-warm-gray">{a.erstelltAm}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="terra">{a.kategorie}</Badge>
                  <Badge variant={istBeantwortet ? 'sage' : 'amber'}>{istBeantwortet ? 'beantwortet' : 'offen'}</Badge>
                </div>
              </div>
              <p className="text-sm bg-bg rounded p-3 mb-3">{a.nachricht}</p>
              {a.antwort && <p className="text-xs text-sage bg-sage-pale rounded p-2 mb-3"><strong>Antwort:</strong> {a.antwort}</p>}
              {!istBeantwortet && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Antwort eingeben..."
                    value={antworten[a.id] ?? ''}
                    onChange={e => setAntworten(prev => ({ ...prev, [a.id]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
                  />
                  <Button variant="primary" className="text-xs"
                    onClick={() => setBeantwortet(prev => new Set([...prev, a.id]))}>
                    Antwort senden (Demo)
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Admin-Panel im Browser prüfen**

Navigiere durch alle Admin-Seiten. Prüfe: Produkt hinzufügen/bearbeiten/löschen funktioniert via Mock-Store, Kunde-Detail erreichbar, Anfragen beantwortbar.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: admin panel with customer management, products CRUD, and support tickets"
```

---

## Task 6: Login-Placeholder und Marketing-Seiten

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/wie-es-funktioniert/page.tsx`
- Create: `src/app/produkte/page.tsx`
- Create: `src/app/faq/page.tsx`
- Create: `src/app/ueber-uns/page.tsx`
- Create: `src/app/kontakt/page.tsx`

- [ ] **Step 1: Login-Placeholder**

Erstelle `src/app/login/page.tsx`:

```typescript
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="text-center max-w-sm">
        <h1 className="font-serif text-3xl font-semibold mb-3">Anmelden</h1>
        <p className="text-warm-gray text-sm mb-6">Login wird in Phase 2 implementiert (NextAuth.js).</p>
        <div className="bg-amber-pale border border-amber rounded-lg p-4 text-sm text-amber mb-6">
          Demo-Modus: <Link href="/konto" className="underline">Direkt zum Kundenkonto</Link> oder <Link href="/admin" className="underline">zum Admin-Panel</Link>
        </div>
        <Link href="/" className="text-xs text-warm-gray hover:text-dark">← Zur Startseite</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Marketing-Seiten (Wie es funktioniert, Produkte, FAQ)**

Erstelle `src/app/wie-es-funktioniert/page.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SCHRITTE = [
  { num: '01', title: 'Anspruch prüfen', desc: 'Pflegegrad 1–5 und häusliche Pflege reichen aus. Gesetzlich versichert? Dann haben Sie Anspruch auf bis zu 42 € monatlich — kostenlos.' },
  { num: '02', title: 'Box zusammenstellen', desc: 'Wählen Sie aus Handschuhen, Desinfektion, Mundschutz, Pflegebetteinlagen und mehr. Ihr Budget wird live angezeigt.' },
  { num: '03', title: 'Antrag wird gestellt', desc: 'Wir stellen den Antrag bei Ihrer Pflegekasse. Kein Papierkram für Sie — wir erledigen alles.' },
  { num: '04', title: 'Monatliche Lieferung', desc: 'Ihre Box kommt pünktlich jeden Monat zum gewünschten Datum. Sie können jederzeit die Zusammenstellung ändern.' },
]

export default function WieEsFunktioniertPage() {
  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Schritt für Schritt</p>
      <h1 className="font-serif text-5xl font-semibold text-center mb-16">Wie es funktioniert</h1>
      <div className="space-y-12">
        {SCHRITTE.map(s => (
          <div key={s.num} className="flex gap-8">
            <div className="font-serif text-5xl font-semibold text-terra/20 flex-shrink-0 w-16">{s.num}</div>
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-3">{s.title}</h2>
              <p className="text-warm-gray leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Jetzt beantragen</Link>
        </Button>
      </div>
    </div>
  )
}
```

Erstelle `src/app/produkte/page.tsx`:

```typescript
import { MOCK_PRODUKTE } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProduktePublicPage() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Unser Sortiment</p>
      <h1 className="font-serif text-5xl font-semibold text-center mb-4">Alle Produkte</h1>
      <p className="text-warm-gray text-center max-w-xl mx-auto mb-12">Wählen Sie bei der Registrierung genau das aus, was Sie monatlich brauchen. Ihr Budget: bis zu 42 € — vollständig von der Pflegekasse übernommen.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {MOCK_PRODUKTE.map(p => (
          <div key={p.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <Badge variant="terra" className="mb-3">{p.kategorie}</Badge>
            <h3 className="font-medium mb-1">{p.name}</h3>
            <p className="text-xs text-warm-gray mb-3">{p.beschreibung}</p>
            <p className="text-sm font-medium text-terra">{p.preis.toFixed(2).replace('.', ',')} €</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Box zusammenstellen</Link>
        </Button>
      </div>
    </div>
  )
}
```

Erstelle `src/app/faq/page.tsx` (vereinfacht):

```typescript
const FAQS = [
  { frage: 'Was sind Pflegehilfsmittel?', antwort: 'Pflegehilfsmittel sind Produkte, die bei der häuslichen Pflege eingesetzt werden — zum Beispiel Einmalhandschuhe, Desinfektion oder Betteinlagen. Nach § 40 SGB XI haben Pflegebedürftige Anspruch auf bis zu 42 € monatlich.' },
  { frage: 'Wer hat Anspruch?', antwort: 'Alle Personen mit einem anerkannten Pflegegrad 1–5, die zuhause gepflegt werden und gesetzlich krankenversichert sind.' },
  { frage: 'Kostet das Velacare etwas?', antwort: 'Nein. Die Pflegekasse übernimmt die Kosten bis 42 € monatlich vollständig. Für Sie entstehen keine Zuzahlungen.' },
  { frage: 'Wie lange dauert es bis zur ersten Lieferung?', antwort: 'Nach Bearbeitung Ihres Antrags durch die Pflegekasse (ca. 2–4 Wochen) erhalten Sie Ihre erste Box zum gewählten Lieferstichtag.' },
  { frage: 'Kann ich die Box jederzeit ändern?', antwort: 'Ja. Änderungen sind jederzeit im Kundenkonto möglich und gelten ab der nächsten Lieferung.' },
]

export default function FaqPage() {
  return (
    <div className="py-20 px-6 max-w-2xl mx-auto">
      <h1 className="font-serif text-5xl font-semibold text-center mb-16">Häufige Fragen</h1>
      <div className="space-y-6">
        {FAQS.map(faq => (
          <div key={faq.frage} className="border-b border-mid-gray pb-6">
            <h3 className="font-serif text-xl font-semibold mb-2">{faq.frage}</h3>
            <p className="text-warm-gray leading-relaxed">{faq.antwort}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Erstelle `src/app/ueber-uns/page.tsx`:

```typescript
export default function UeberUnsPage() {
  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <h1 className="font-serif text-5xl font-semibold text-center mb-8">Über Velacare</h1>
      <p className="text-warm-gray leading-relaxed text-lg text-center max-w-xl mx-auto">
        Velacare wurde gegründet, weil pflegende Angehörige genug Aufgaben haben — die Beschaffung von Pflegehilfsmitteln sollte nicht dazugehören.
      </p>
    </div>
  )
}
```

Erstelle `src/app/kontakt/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'

export default function KontaktPage() {
  return (
    <div className="py-20 px-6 max-w-lg mx-auto">
      <h1 className="font-serif text-5xl font-semibold text-center mb-8">Kontakt</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray p-6 space-y-4">
        <input placeholder="Ihr Name" className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm" />
        <input placeholder="Ihre E-Mail" type="email" className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm" />
        <textarea rows={4} placeholder="Ihre Nachricht..." className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none" />
        <Button variant="primary" className="w-full">Nachricht senden (Demo)</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Finale Prüfung aller Seiten**

Navigiere durch alle Seiten und prüfe:
- Landing Page → `/beantragen` → Alle 4 Schritte → `/beantragen/danke`
- `/konto` Dashboard → alle Unterseiten
- `/admin` → Kunden, Produkte (CRUD), Lieferungen, Anfragen
- `/login` → Placeholder sichtbar
- Marketing-Seiten: `/wie-es-funktioniert`, `/produkte`, `/faq`, `/ueber-uns`, `/kontakt`

- [ ] **Step 4: Finaler Commit**

```bash
git add -A
git commit -m "feat: login placeholder and all marketing pages — Phase 1 complete"
```

---

## Abschluss Phase 1

Nach Task 6 ist der visuelle Prototyp fertig. Alle Seiten sind klickbar, responsive, und nutzen das Velacare Design-System. Keine Datenbank, kein Auth.

**Nächster Schritt:** Feedback sammeln, dann Phase 2 planen (Prisma-Schema, NextAuth, API Routes, E-Mail).
