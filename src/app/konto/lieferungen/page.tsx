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
