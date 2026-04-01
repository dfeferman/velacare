# Produktdesign-Richtlinien: Velacare Digital Ecosystem
> Version 3.0 — abgeleitet aus Brand Guide v2.0, Linde & Lavendel Wireframes und Wie-es-funktioniert-Screens

---

## 1. Overview & Creative North Star: "Warme Autorität"

Velacare verbindet **medizinische Verlässlichkeit** mit **menschlicher Wärme**. Das Design fühlt sich an wie ein empathischer Berater, nicht wie ein Formular oder eine App. Die Ästhetik ist redaktionell-warm: Weißraum, Serifenschriften als Design-Statement, erdige Grün- und Terrakottatöne statt klinischer Kälte oder steriler Blautöne.

Wir vermeiden starre "Box-an-Box"-Layouts. Stattdessen arbeiten wir mit **beabsichtigter Asymmetrie**, großzügigem Weißraum und einer harmonischen Schichtung warmer Oberflächen. Das Ergebnis ist eine Benutzeroberfläche, die sich anfühlt wie ein hochwertiges Pflegemagazin — nicht wie eine Behörden-App.

---

## 2. Farbsystem

Unsere Palette basiert auf warmen Grün- und Terrakottatönen. **Kühle Blautöne und Erdgrau werden als Primärfarben kategorisch ausgeschlossen.** Das Ziel ist eine hygienisch-einladende, zugleich warme Atmosphäre.

### Token-Referenz

| Token | Hex | Verwendung |
|---|---|---|
| `primary` | `#4A7259` | Primäre CTAs, Links, Akzente, Icon-Farbe |
| `primary-mid` | `#5E8C6E` | Hover-Zustände, interaktive Highlights |
| `primary-light` | `#E8F2EB` | Badges, aktive Chip-Zustände |
| `primary-pale` | `#F0F6F2` | Hintergründe für Sektionen (warm-grün), Dot-Grid-Tint |
| `primary-dark` | `#375E46` | Texte auf hellen Primärflächen, deep hover |
| `secondary` | `#9E5A35` | Akzente, Logo-Herz, Dekoration, Italic-Highlights |
| `secondary-light` | `#D4906E` | Deco-Rules, Gradienten, sekundäre Highlights |
| `secondary-pale` | `#F7EEE7` | Warme Sektions-Hintergründe (Terrakotta-Tint) |
| `dark` | `#261E17` | Primärer Text, Headlines, Footer-Hintergrund |
| `background` | `#FAF6EF` | Seiten-Hintergrund (warmes Off-White) |
| `surface` | `#FFFDF7` | Karten, Modals, erhöhte Inhaltsebenen |
| `outline` | `#D5CAB9` | Divider, Ghost Borders (max. 20 % Opacity), Card-Borders |
| `on-surface` | `#261E17` | Primärer Text auf hellen Flächen |
| `on-surface-variant` | `#6B5747` | Sekundärer Text, Placeholders, Beschriftungen |
| `section-warm` | `#EEF4F1` | Abwechslungs-Sektion (grün-warm) |
| `section-terra` | `#F5EDE5` | Abwechslungs-Sektion (terrakotta-warm) |

### Semantische Systemfarben (Status)

| Zustand | Farbe | Token |
|---|---|---|
| Info / Link | `#185FA5` | `sky` |
| Warnung | `#BA7517` | `amber` |
| Fehler | `#E05A3A` | (inline, kein Token) |
| Erfolg | `primary` | `#4A7259` |

### Die „No-Line"-Regel

**1px Rahmen zur Sektionierung sind strengstens untersagt.**

Trennungen entstehen ausschließlich durch:
1. **Farbflächen-Wechsel:** z.B. `section-warm` nach `background` nach `section-terra`
2. **Abstände:** Großzügige `padding`/`margin`-Abstände (mind. `py-20` / `5rem`)
3. **Ghost Borders:** Nur wenn zwingend nötig — `outline` mit max. 20 % Opacity

### Oberflächen-Hierarchie (Tonal Layering)

| Ebene | Token | Hex | Verwendung |
|---|---|---|---|
| Seiten-Hintergrund | `background` | `#FAF6EF` | Basisschicht |
| Sektion-Akzent (grün) | `section-warm` / `primary-pale` | `#EEF4F1` / `#F0F6F2` | Abwechslungs-Sektionen |
| Sektion-Akzent (terra) | `section-terra` / `secondary-pale` | `#F5EDE5` / `#F7EEE7` | Abwechslungs-Sektionen |
| Inhalts-Karte | `surface` | `#FFFDF7` | Karten, erhöhte Elemente |

---

## 3. Typografie: Die redaktionelle Stimme

Die Kombination aus klassischer Serif und moderner Sans-Serif erzeugt die Balance zwischen **medizinischer Autorität** und **digitaler Zugänglichkeit**.

### Font Stack

```
font-headline: "Newsreader", Georgia, serif
font-body:     "DM Sans", system-ui, sans-serif
font-mono:     "DM Mono", monospace
```

Google Fonts Import:
```
Newsreader: ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600
DM Sans:    ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400
DM Mono:    wght@400
```

### Anwendung

- **Headlines (Newsreader):** `display-lg` bis `headline-sm` für alle narrativen Elemente. Strahlt Ruhe und Expertise aus. Kursiv-Variante (`font-italic`) für Zitate, Slogans und dekorative Akzente in `secondary` (#9E5A35).
- **Body & UI (DM Sans):** Gewicht 300–500 für alle funktionalen Texte, Daten und Interaktionselemente. `body-md` (15px, weight 400) ist der Standard für Lesbarkeit. Gewicht 300 für Lead-Texte.
- **Labels & Eyebrows:** DM Sans, 11px, `font-weight: 500`, `letter-spacing: 0.12–0.2em`, `text-transform: uppercase`, Farbe `on-surface-variant`.
- **Technische Daten (DM Mono):** Hex-Codes, Token-Namen, Zahlen-Ausgaben.
- **Kontrast:** `on-surface` für primäre Texte; `on-surface-variant` für Sekundärinformationen (WCAG AA einhalten).

### Dekorative Regel (Deco-Rule)

Ein 44×2 px Streifen als visueller Trenner vor Headlines — Verlauf von `secondary` (#9E5A35) zu `secondary-light` (#D4906E):
```css
.deco-rule {
  width: 44px; height: 2px;
  background: linear-gradient(90deg, #9E5A35, #D4906E);
  border-radius: 1px;
}
```

---

## 4. Elevation & Tiefe: Tonal Layering + Ambient Shadows

**Traditionelle Schlagschatten werden gemieden.** Hierarchie entsteht durch Tonal Layering und extrem diffuse Schatten.

- **Layering:** Karte (`surface` #FFFDF7) auf Sektion (`primary-pale` #F0F6F2) erzeugt natürliche Tiefe ohne Schatten.
- **Card Hover Shadow:** `0 10px 30px rgba(74,114,89,0.11), 0 3px 10px rgba(38,30,23,0.06)` — getöntes Grün-Braun, niemals reines Schwarz.
- **Floating Elements:** `blur: 40px`, `spread: 0`, `opacity: 6–11 %`, Farbe: `rgba(74,114,89,…)`.
- **Nav Glassmorphismus:** `background: rgba(255,253,247,0.94)` + `backdrop-filter: blur(16px)`.
- **Ghost Borders (Ausnahme):** `border: 1px solid rgba(213,202,185,0.35)` — max. 35 % Opacity.

---

## 5. Komponenten-Leitfaden

Alle Komponenten folgen `border-radius: 0.5rem` (8px) als Standard; Karten `1rem`; Chips/Pills `9999px`.

### Navigation

- Fixiert, Höhe 52px, `surface` mit 94 % Opacity + Backdrop-Blur (16px).
- Scroll-State: `background: rgba(255,253,247,0.94)`, schwache Box-Shadow (`0 1px 0 rgba(213,202,185,0.5)`).
- Logo: Newsreader, 20px, weight 600, Farbe `dark`.
- Links: DM Sans, 12px, `on-surface-variant`; Hover/Active: `primary` + 2px Bottom-Border.
- CTA-Badge rechts: `primary-pale` Hintergrund, `primary` Text, Pill-Form.

### Buttons & Interaktion

- **Primary:** `background: primary (#4A7259)`, `color: white`, `border-radius: 8px`, `font: DM Sans 14px weight 500`. Hover: `primary-mid` (#5E8C6E). Mit **Ripple Effect** bei Klick (Micro-Feedback, 200ms).
- **Secondary/Ghost:** `background: transparent`, `border: 1.5px solid outline`, `color: dark`. Hover: `background: primary-pale`.
- **Ghost CTA:** `background: primary-pale`, `color: primary`. Kein Border.
- **Chips (Filter):** Aktiv: `background: primary (#4A7259)`, `color: white`, `box-shadow: 0 2px 8px rgba(74,114,89,0.3)`. Inaktiv: Hover: `background: primary-pale`. Form: `border-radius: full` (Pill).

### Karten & Listen (Editorial Cards)

- Hintergrund: `surface (#FFFDF7)`, `border: 1px solid outline`, `border-radius: 1rem`.
- **Card Hover Lift:** `transform: translateY(-3px)` + Ambient Shadow — Dauer 240ms, Easing `ease`.
- Headlines in Newsreader, die optisch über den Karten-Rand „hinausragen" (Asymmetrie-Effekt).
- Trennungen innerhalb von Karten: nur durch Weißraum (`spacing-4`) oder Farbwechsel — niemals Trennlinien.
- Dekorativer Akzentbalken: 4px breiter vertikaler Streifen in `primary` oder `secondary` am linken Rand (Slogan-Cards, Value-Cards).

### Eingabefelder (Inputs)

- Hintergrund: `surface`, `border: 1.5px solid rgba(213,202,185,0.5)`.
- Fokus: `border-color: primary`, keine Box-Shadow-Glow.
- Fehlerstatus: `border-color: #E05A3A`, unterstützender Fehlertext in `#9E2910`.
- Placeholder: `on-surface-variant (#6B5747)`.

### Akkordeon (FAQ)

- Öffnen/Schließen via CSS Grid-Rows-Animation: `grid-template-rows: 0fr → 1fr`, Dauer 340ms, `cubic-bezier(.4,0,.2,1)`.
- Chevron-Rotation: 180° bei `open`-State, Dauer 300ms.

### Spezifische Healthcare-Komponenten

- **Pflegekassen-Rechner / Budget-Bar:** Visueller Balken mit **Bar Fill Animation** (`0 → 100%` in 1.5s, `cubic-bezier(.4,0,.2,1)`, Delay 1.6s). Hintergrund: `primary-pale`.
- **Grade-Tabs (Pflegegrad-Auswahl):** Aktiv: `primary`-Hintergrund, weiße Schrift, grüner Drop-Shadow. Inaktiv-Hover: `primary-pale`.
- **Produkt-Counter:** Runde Add/Remove-Buttons (30×30px), `border: 1.5px solid outline`. Hover: `border-color: primary`, `background: primary-pale`. Zahl mit **Count Reveal Animation** (0.45s ease).
- **Care-Timeline:** Vertikaler Pfad ohne durchgehende Linie. Stattdessen: Verbindungs-Dots in `primary-pale` mit `primary`-Border; Connector-Linien als **SVG Path Drawing** (`scaleY(0) → scaleY(1)`, 0.8s, `cubic-bezier(.4,0,.2,1)`).
- **Arch Photo Frame:** Foto mit Arch-Clip `border-radius: 50% 50% 14px 14px / 56% 56% 14px 14px` für ikonischen geschwungenen Rahmen.
- **Dot-Grid Hintergrund:** `radial-gradient(circle, rgba(74,114,89,0.08) 1px, transparent 1px)` mit `background-size: 22px 22px` — für Hero-Bereiche.

---

## 6. Animation-System

Alle Animationen folgen den Performance-Regeln: nur `transform` und `opacity` animieren (kein `width`, `height`, `top`). `prefers-reduced-motion` immer respektieren.

### Timing-Referenz

| Typ | Dauer | Easing |
|---|---|---|
| Micro-Interaction (Button, Hover) | 150–240ms | `ease` |
| Entrance (FadeUp, Reveal) | 520–550ms | `ease` |
| Bar Fill / Path Draw | 800ms–1.5s | `cubic-bezier(.4,0,.2,1)` |
| Akkordeon | 340ms | `cubic-bezier(.4,0,.2,1)` |
| Ambient Float (Hero-Bild) | 7s | `ease-in-out infinite` |
| Eyebrow Pulse Dot | 2.6s | `ease-in-out infinite` |
| Cover Glow Pulse | 6s | `ease-in-out infinite` |

### Pflicht-Animationen pro Context

| Context | Animationen |
|---|---|
| **Seitenlade / Hero** | FadeUp stagger (Eyebrow → Headline → Lead → CTA), Eyebrow Pulse Dot, Ambient Float auf Foto |
| **Scroll-basierte Sektionen** | Scroll Reveal (`.reveal` + IntersectionObserver), stagger via `reveal-d1` bis `reveal-d4` |
| **Statistiken / Zahlen** | Count-Up + Count Reveal |
| **Budget / Balken** | Bar Fill |
| **Buttons** | Ripple Effect bei Klick |
| **Karten** | Card Hover Lift (translateY -3px + Shadow) |
| **FAQ** | Akkordeon (CSS Grid-Rows) |
| **Timeline / Prozess** | SVG Path Drawing (Connector-Linien) |
| **Erfolg / Bestätigung** | Animated Checkmark + optionaler Confetti Burst |
| **Ladezustände** | Skeleton Loader (niemals Spinner) |
| **Hero Background** | Dot-Grid Tint + optional Mouse Parallax |

### FadeUp / Scroll Reveal (Standard-Entrance)

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 0.52s ease both; }

.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.52s ease, transform 0.52s ease;
}
.reveal.revealed { opacity: 1; transform: translateY(0); }
.reveal-d1 { transition-delay: 0.1s; }
.reveal-d2 { transition-delay: 0.2s; }
.reveal-d3 { transition-delay: 0.3s; }
.reveal-d4 { transition-delay: 0.4s; }
```

### Eyebrow Pulse Dot

```css
@keyframes pulseDot {
  0%,100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.7); opacity: 0.35; }
}
.eyebrow-dot { animation: pulseDot 2.6s ease-in-out infinite; }
```

### Card Hover Lift

```css
.card-lift {
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}
.card-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(74,114,89,0.11), 0 3px 10px rgba(38,30,23,0.06);
}
```

### Bar Fill (Pflegekassen-Budget)

```css
@keyframes barFill {
  from { width: 0; }
  to   { width: 100%; }
}
.bar-fill { animation: barFill 1.5s cubic-bezier(.4,0,.2,1) 1.6s both; }
```

### Ambient Float (Hero-Bild)

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
.photo-float { animation: float 7s ease-in-out infinite; }
```

### Nav Scroll-Glassmorphismus

```css
#main-nav { transition: background 0.3s ease, box-shadow 0.3s ease; }
#main-nav.scrolled {
  background: rgba(255,253,247,0.94) !important;
  box-shadow: 0 1px 0 rgba(213,202,185,0.5);
  backdrop-filter: blur(16px);
}
```

### SVG Timeline Connector Draw

```css
.connector {
  width: 2px;
  background: linear-gradient(to bottom, #4A7259, #5E8C6E);
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 0.8s cubic-bezier(.4,0,.2,1);
}
.connector.revealed { transform: scaleY(1); }
```

---

## 7. Do's und Don'ts

| Do | Don't |
| :--- | :--- |
| **Erdige Wärme:** Grün (#4A7259) + Terrakotta (#9E5A35) als Markenfarben | **Kühle Blautöne als Primärfarben:** `sky` (#185FA5) nur für Info/Links |
| **Weißraum:** `py-20` (5rem) für Sektionsabstände | **Informationsdichte:** Alles "above the fold" quetschen |
| **Layering:** `background` → `section-warm` → `surface` für Tiefe | **Hard Borders:** 1px solid für Box-Sektionierung |
| **Newsreader Headlines:** Als redaktionelles Design-Statement | **All-Caps Headlines:** Wirkt alarmierend, nicht warm |
| **Tonal Shadows:** `rgba(74,114,89,…)` — getöntes Grün, niemals `#000` | **Schwarze Schatten:** Hohe Opacity oder reines Schwarz |
| **8px Rundungen** (`DEFAULT`), Karten 16px, Pills `full` | **Spitze Ecken:** 0px wirkt aggressiv in der Pflege |
| **FadeUp stagger** bei Entrances, **Scroll Reveal** im Viewport | **Animationen ohne `prefers-reduced-motion`-Fallback** |
| **Skeleton Loader** für Ladezustände | **Spinner:** Immer durch Skeleton ersetzen |
| **DM Sans** für Body/UI (weight 300–500) | **Manrope oder andere Sans-Serif** — nicht im Stack |
| **Deco-Rule** (secondary Gradient) als Headline-Trenner | **Trennlinien zwischen Listenpunkten** innerhalb von Karten |

---

## 8. Logo & Markensymbol

Das Velacare-Logo zeigt **zwei schützende Arme** (zwei geschwungene Linien + Endpunkte) mit einem **Herz in der Mitte** als Symbol für Fürsorge.

- Arme: `primary (#4A7259)` auf hellen Hintergründen; `primary-light (#B3D4C5)` auf dunklen Hintergründen.
- Herz: `secondary (#9E5A35)` auf hellen Hintergründen; `secondary-light (#D4906E)` auf dunklen.
- Wortmarke: Newsreader, 44px, weight 600, `dark (#261E17)` oder `surface (#FFFDF7)`.
- Subline: DM Sans, 11px, weight 400, `letter-spacing: 0.28em`, Uppercase. Farbe: `primary` auf hell, `primary-light` auf dunkel.

---

*Dieses Design-System ist ein lebendes Dokument. Es dient dazu, Velacare als vertrauenswürdigen Marktführer für digitale Pflege-Fürsorge zu etablieren — durch Design, das wärmt, beruhigt und führt.*
