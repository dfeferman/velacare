# Wireframes (Google Stitch)

Export aus dem Stitch-Projekt **Produkte & Box** (`8244422556159444756`).  
Jeder Unterordner enthält:

- `screen.html` – exportierter Screen-Code
- `screen.png` – Screenshot (von Stitch bereitgestellte Download-URL)
- `meta.json` – Titel, Screen-ID, Quell-URLs

`manifest.json` listet alle Screens in der vorgegebenen Reihenfolge.

## Neu exportieren

API-Key aus [Stitch](https://stitch.withgoogle.com) → Einstellungen → API Keys als Umgebungsvariable setzen:

```powershell
$env:STITCH_API_KEY="dein-key"
npm run stitch:wireframes
```

Skript: `scripts/export-stitch-wireframes.mjs` (nutzt `@google/stitch-sdk`).
