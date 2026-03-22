/**
 * Lädt HTML und Screenshot-URLs aus Google Stitch (Projekt/Screens) und speichert sie unter wireframes/.
 * Benötigt: STITCH_API_KEY (z. B. aus Stitch → Einstellungen → API Keys)
 *
 *   set STITCH_API_KEY=...   (cmd)
 *   $env:STITCH_API_KEY="..."   (PowerShell)
 *   npm run stitch:wireframes
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stitch } from "@google/stitch-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "wireframes");

const PROJECT_ID = "8244422556159444756";

/** Reihenfolge und Metadaten wie in der Stitch-Anweisung */
const SCREENS = [
  { id: "67084893c86441e9981610de405a4492", title: "Startseite Hero zuerst" },
  { id: "95a7fa7db67642c7ad2b7a6e8210d458", title: "Registrierung Funnel (Wireframe-Style)" },
  { id: "a0e38936804d4932ae0ee21b039c93a9", title: "Wie es funktioniert (Final)" },
  { id: "94b665fa50db4143841e96a4f63ad2b2", title: "Produkte & Box (Wireframe-Final)" },
  { id: "0939af279e5e4f629728f21e822b3458", title: "Funnel Schritt 1: Anspruch" },
  { id: "d7a66d22ec9f4e2181c63e8bf7746dff", title: "Funnel Schritt 3: Box" },
  { id: "e5ac3c8dadeb4b89b9500c12f2650c5d", title: "Funnel Schritt 2: Daten" },
  { id: "048cb354fb1c4534afcd9ed54fe6d694", title: "Funnel Schritt 4: Bestätigung" },
  { id: "ed90935e623940f0902de29b9e738c85", title: "Danke-Seite (Final)" },
];

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname;
    const e = path.extname(p).toLowerCase();
    if (e && e.length <= 6) return e;
  } catch {
    /* ignore */
  }
  return ".png";
}

async function downloadToFile(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Download ${res.status} ${res.statusText}: ${url.slice(0, 120)}…`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

async function main() {
  if (!process.env.STITCH_API_KEY?.trim()) {
    console.error(
      "Fehlende Umgebungsvariable STITCH_API_KEY. Key aus Stitch → Einstellungen → API Keys setzen."
    );
    process.exit(1);
  }

  await fs.mkdir(OUT, { recursive: true });
  const manifest = {
    projectId: PROJECT_ID,
    projectTitle: "Produkte & Box",
    exportedAt: new Date().toISOString(),
    screens: [],
  };

  const project = stitch.project(PROJECT_ID);

  for (let i = 0; i < SCREENS.length; i++) {
    const { id: screenId, title } = SCREENS[i];
    const order = String(i + 1).padStart(2, "0");
    const slug = slugify(title) || screenId.slice(0, 8);
    const dir = path.join(OUT, `${order}-${slug}`);
    await fs.mkdir(dir, { recursive: true });

    process.stdout.write(`[${order}/${SCREENS.length}] ${title} … `);

    const screen = await project.getScreen(screenId);
    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();

    if (!htmlUrl || !imageUrl) {
      console.error("fehlende URLs", { htmlUrl: !!htmlUrl, imageUrl: !!imageUrl });
      process.exit(1);
    }

    const imgExt = extFromUrl(imageUrl);
    const htmlPath = path.join(dir, "screen.html");
    const imagePath = path.join(dir, `screen${imgExt}`);

    await downloadToFile(htmlUrl, htmlPath);
    await downloadToFile(imageUrl, imagePath);

    const meta = {
      title,
      screenId,
      projectId: PROJECT_ID,
      htmlUrl,
      imageUrl,
      files: { html: path.relative(ROOT, htmlPath), image: path.relative(ROOT, imagePath) },
    };
    await fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

    manifest.screens.push({ order: i + 1, title, screenId, folder: path.relative(ROOT, dir) });
    console.log("OK");
  }

  await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nFertig: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
