// src/app/admin/produkte/page.tsx
import { getAdminProdukte } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ProdukteClient } from './produkte-client'

export default async function ProdukteAdminPage() {
  await requireAdmin()
  const raw = await getAdminProdukte()

  const produkte = raw.map(p => ({
    id:        p.id,
    name:      p.name,
    kategorie: p.kategorie as string,
    preis:     Number(p.preis),
    aktiv:     p.aktiv,
  }))

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Produkte</h1>
      <ProdukteClient produkte={produkte} />
    </div>
  )
}
