import { getAdminLieferungen } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const fmt = new Intl.DateTimeFormat('de-DE')

export default async function LieferungenAdminPage() {
  await requireAdmin()
  const lieferungen = await getAdminLieferungen()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {lieferungen.map(l => {
          const snapshot = (l.box_snapshot ?? []) as unknown as BoxProdukt[]
          const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
          return (
            <div
              key={l.id}
              className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none"
            >
              <div>
                <p className="text-sm font-medium">
                  {l.kunde.vorname} {l.kunde.nachname}
                </p>
                <p className="text-xs text-warm-gray">
                  {fmt.format(l.geplant_fuer)} · {gesamtwert.toFixed(2).replace('.', ',')} € · {snapshot.length} Produkte
                </p>
              </div>
              <Badge variant={
                l.status === 'zugestellt' ? 'sage'  :
                l.status === 'geplant'    ? 'amber' : 'sky'
              }>
                {l.status}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
