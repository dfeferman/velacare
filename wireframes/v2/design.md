# Produktdesign-Richtlinien: Velacare Digital Ecosystem

## 1. Overview & Creative North Star: "Der Digitale Kurator"

Dieses Design-System bricht mit dem Standard-Layout herkömmlicher Gesundheits-Apps. Anstatt klinischer Kälte setzen wir auf **"Den Digitalen Kurator"** – eine Ästhetik, die redaktionelle Eleganz mit empathischer Klarheit verbindet.

Wir vermeiden starre Raster und "Box-an-Box"-Layouts. Stattdessen nutzen wir **beabsichtigte Asymmetrie**, großzügigen Weißraum und eine harmonische Schichtung von Oberflächen. Das Ziel ist eine Benutzeroberfläche, die sich nicht wie eine Datenbank anfühlt, sondern wie ein hochwertiges Magazin für Wohlbefinden und Fürsorge. Vertrauen entsteht hier nicht durch Kontrollkästchen, sondern durch eine ruhige, souveräne visuelle Führung.

---

## 2. Farbsystem & Oberflächen-Logik

Unsere Palette basiert auf kühlen, hellen Blau- und Grüntönen. Wir schließen Erdtöne kategorisch aus, um eine frische, hygienische und dennoch einladende Atmosphäre zu schaffen.

### Die "No-Line" Regel
In diesem System sind **1px Rahmen zur Sektionierung strengstens untersagt**. Trennungen werden ausschließlich durch:
1. **Farbflächen-Wechsel:** Ein Bereich in `surface_container_low` auf einem `surface` Hintergrund.
2. **Abstände:** Nutzung der Spacing-Skala (z.B. `12` oder `16`) zur Schaffung von thematischen Inseln.

### Oberflächen-Hierarchie (Nesting)
Wir betrachten das Interface als eine Serie von physischen Ebenen. Nutzen Sie die `surface_container`-Tiers, um Tiefe zu erzeugen:
* **Hintergrund:** `surface` (#f4fafd)
* **Inhaltsebene 1:** `surface_container_low` (#eef5f7) für großflächige Bereiche.
* **Interaktive Karten:** `surface_container_lowest` (#ffffff) für maximale Hervorhebung auf dunkleren Untergründen.

### Glassmorphismus & Verläufe
Um die "Out-of-the-box"-Optik zu vermeiden, setzen wir bei schwebenden Elementen (Modals, Navigation) auf `surface_bright` mit einem **Backdrop-Blur (12px - 20px)**. Primäre CTAs erhalten einen subtilen linearen Verlauf von `primary` zu `primary_container`, um visuelle Tiefe und eine "greifbare" Qualität zu erzeugen.

---

## 3. Typografie: Die redaktionelle Stimme

Die Kombination aus einer klassischen Serifenschrift und einer modernen Sans-Serif schafft die Balance zwischen medizinischer Autorität und digitaler Zugänglichkeit.

* **Headlines (Newsreader):** Nutzen Sie `display-lg` bis `headline-sm` für alle narrativen Elemente. Diese Schrift strahlt Ruhe und Expertise aus. Setzen Sie Headlines oft asymmetrisch oder mit leicht erhöhtem Zeilenabstand (`leading-relaxed`), um den "Magazin-Look" zu unterstreichen.
* **Body & UI (Manrope):** Für funktionale Texte, Daten und Interaktionselemente. `body-md` ist unser Standard für Lesbarkeit.
* **Kontrast:** Nutzen Sie `on_surface` für Texte. Für sekundäre Informationen verwenden Sie `on_surface_variant`, aber achten Sie stets auf die Barrierefreiheit (WCAG AA).

---

## 4. Elevation & Tiefe: Tonal Layering

Vergessen Sie traditionelle Schlagschatten. Wir definieren Hierarchie durch **Tonal Layering**.

* **Layering-Prinzip:** Ein "Anheben" eines Objekts geschieht durch den Wechsel zu einer helleren Oberfläche (`surface_container_lowest`) auf einem leicht dunkleren Grund (`surface_container`).
* **Ambient Shadows:** Wenn Schatten unverzichtbar sind (z.B. bei schwebenden Action-Buttons), verwenden wir extrem diffuse Schatten: `blur: 40px`, `spread: 0`, `opacity: 6%`. Die Schattenfarbe ist ein getöntes Blau-Grau, niemals reines Schwarz.
* **Ghost Borders:** Falls eine Abgrenzung zwingend erforderlich ist, nutzen wir `outline_variant` mit einer Deckkraft von maximal **15%**. Ein harter Kontrast wird vermieden.

---

## 5. Komponenten-Leitfaden

Alle Komponenten folgen der Rundung `DEFAULT` (0.5rem / 8px) für eine freundliche, aber professionelle Anmutung.

### Buttons & Interaktion
* **Primary Button:** Nutzt den `primary` zu `primary_container` Verlauf. Text in `on_primary`, Typografie `title-sm` (Manrope).
* **Secondary/Ghost:** Kein Rahmen. Hintergrund `surface_container_high` oder rein textbasiert mit `primary` Farbe.
* **Chips:** Nutzen Sie `secondary_container` für aktive Zustände. Ecken hier ausnahmsweise auf `full` (Pill-Shape) für maximale Differenzierung zu Buttons.

### Karten & Listen (Editorial Cards)
* **Verbot von Trennlinien:** Listen innerhalb von Karten werden durch vertikalen Weißraum (`spacing.4`) oder subtile Hintergrundwechsel getrennt.
* **Struktur:** Eine Karte im Velacare-System hat oft eine überhängende Headline in `Newsreader`, die den Rand der Karte leicht optisch durchbricht (Asymmetrie).

### Eingabefelder (Inputs)
* **Stil:** `surface_container_lowest` als Hintergrund. Nur eine untere Linie in `primary` bei Fokus, ansonsten rahmenlos mit subtiler `outline_variant` (20% Opacity).
* **Fehlerstatus:** Nutzung von `error` und `error_container` – vermeiden Sie jedoch aggressives Rot; betonen Sie den Fehler eher durch unterstützenden Text in `on_error_container`.

### Spezifische Healthcare-Komponenten
* **Vital-Graphen:** Nutzen Sie `primary_fixed` und `tertiary_fixed` für Datenlinien. Hintergründe der Graphen sollten `surface_container_low` sein, um Ruhe zu vermitteln.
* **Care-Timeline:** Ein vertikaler Pfad ohne durchgehende Linie. Nutzen Sie stattdessen `spacing.8` Dots in `primary_container`.

---

## 6. Do's und Don'ts

| Do | Don't |
| :--- | :--- |
| **Mut zum Weißraum:** Nutzen Sie `spacing.20` für Sektionsabstände. | **Information Density:** Versuchen Sie nicht, alles "above the fold" zu quetschen. |
| **Layering:** Schichten Sie Oberflächen (`surface` -> `container`). | **Hard Borders:** Verwenden Sie keine 1px solid Borders für Boxen. |
| **Serifen-Fokus:** Nutzen Sie Headlines als Design-Statement. | **All-Caps:** Vermeiden Sie durchgehende Großschreibung, sie wirkt alarmierend. |
| **Tonal Shadows:** Schatten müssen "atmen" und blau/grau getönt sein. | **Standard-Grey Shadows:** Nutzen Sie niemals `#000000` mit hoher Opazität. |
| **Sanfte Rundungen:** Halten Sie sich strikt an `ROUND_EIGHT` (8px). | **Spitze Ecken:** 0px Rundungen wirken in der Pflege aggressiv und unnatürlich. |

---

*Dieses Design-System ist ein lebendes Dokument. Es dient dazu, Velacare als Marktführer für digitale Fürsorge zu etablieren – durch Design, das heilt, beruhigt und führt.*