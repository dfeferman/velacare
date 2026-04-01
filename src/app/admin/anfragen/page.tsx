import { getAdminAnfragen } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AnfragenClient } from './anfragen-client'

export default async function AnfragenAdminPage() {
  await requireAdmin()
  const anfragen = await getAdminAnfragen()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Anfragen</h1>
      <AnfragenClient anfragen={anfragen} />
    </div>
  )
}
