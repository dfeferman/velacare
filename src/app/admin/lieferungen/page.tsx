import { MOCK_LIEFERUNGEN, MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export default function LieferungenAdminPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {MOCK_LIEFERUNGEN.map(l => {
          const kunde = MOCK_KUNDEN.find(k => k.id === l.kundeId)
          return (
            <div key={l.id} className="flex items-center justify-between px-5 py-4 border-b border-mid-gray last:border-none">
              <div>
                <p className="text-sm font-medium">{kunde?.vorname} {kunde?.nachname}</p>
                <p className="text-xs text-warm-gray">{l.datum} · {l.gesamtwert.toFixed(2).replace('.', ',')} € · {l.boxSnapshot.length} Produkte</p>
              </div>
              <Badge variant={l.status === 'geliefert' ? 'sage' : l.status === 'geplant' ? 'amber' : 'sky'}>{l.status}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
