// src/lib/dal/produkte.ts
import { prisma } from '@/lib/prisma'
import type { Produkt, ProduktKategorie } from '@/lib/types'

/** Budget limit in cents (€42.00 per §40 SGB XI). Used for server-side logic. */
export const BUDGET_LIMIT_CENT = 4200

/** Budget limit in euros. Convenience constant for UI display. */
export const BUDGET_LIMIT_EUR = 42.00

/** Map Prisma ProduktKategorie enum (lowercase) → app ProduktKategorie (title-case) */
function mapKategorie(k: string): ProduktKategorie {
  const map: Record<string, ProduktKategorie> = {
    handschuhe:    'Handschuhe',
    desinfektion:  'Desinfektion',
    mundschutz:    'Mundschutz',
    schutzkleidung: 'Schutzkleidung',
    hygiene:       'Hygiene',
    sonstiges:     'Sonstiges',
  }
  return map[k] ?? 'Sonstiges'
}

/** Map a raw Prisma Produkt row to the app's Produkt interface */
function mapProdukt(raw: {
  id: string
  name: string
  beschreibung: string
  preis: { toNumber(): number } | number
  kategorie: string
  aktiv: boolean
  bild_url: string
  varianten: unknown
}): Produkt {
  const varianten = raw.varianten as { mengenOptionen?: string[] } | null
  return {
    id:            raw.id,
    name:          raw.name,
    beschreibung:  raw.beschreibung,
    preis:         typeof raw.preis === 'number' ? raw.preis : raw.preis.toNumber(),
    kategorie:     mapKategorie(raw.kategorie),
    aktiv:         raw.aktiv,
    bildUrl:       raw.bild_url,
    mengenOptionen: varianten?.mengenOptionen,
  }
}

/** Fetch all active products ordered by sortierung, then name */
export async function getAktiveProdukte(): Promise<Produkt[]> {
  const rows = await prisma.produkt.findMany({
    where: { aktiv: true },
    orderBy: [{ sortierung: 'asc' }, { name: 'asc' }],
  })
  return rows.map(mapProdukt)
}
