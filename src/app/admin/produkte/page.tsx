// src/app/admin/produkte/page.tsx
import { getAdminProdukte } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ProdukteClient } from './produkte-client'
import type { ProduktAdminRow } from './types'

export default async function ProdukteAdminPage() {
  await requireAdmin()
  const raw = await getAdminProdukte()

  const produkte: ProduktAdminRow[] = raw.map(p => ({
    id:                   p.id,
    name:                 p.name,
    kategorie:            p.kategorie,
    preis:                Number(p.preis),
    beschreibung:         p.beschreibung,
    hersteller:           p.hersteller,
    pflichtkennzeichnung: p.pflichtkennzeichnung ?? null,
    aktiv:                p.aktiv,
    sortierung:           p.sortierung,
    varianten:            p.varianten as { mengenOptionen?: string[] } | null,
  }))

  return <ProdukteClient produkte={produkte} />
}
