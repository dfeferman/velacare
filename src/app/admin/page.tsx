import { MOCK_KUNDEN, MOCK_LIEFERUNGEN, MOCK_ANFRAGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function AdminDashboard() {
  const offeneAnfragen = MOCK_ANFRAGEN.filter(a => a.status === 'offen')
  const aktiveKunden = MOCK_KUNDEN.filter(k => k.status === 'aktiv')
  const geplanteL = MOCK_LIEFERUNGEN.filter(l => l.status === 'geplant')

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktive Kunden', wert: aktiveKunden.length, farbe: 'text-terra' },
          { label: 'Geplante Lieferungen', wert: geplanteL.length, farbe: 'text-sky' },
          { label: 'Offene Anfragen', wert: offeneAnfragen.length, farbe: 'text-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">{kpi.label}</p>
            <p className={`font-serif text-4xl font-semibold ${kpi.farbe}`}>{kpi.wert}</p>
          </div>
        ))}
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray flex justify-between items-center">
          <p className="text-sm font-medium">Neueste Kunden</p>
          <Link href="/admin/kunden" className="text-xs text-terra hover:underline">Alle ansehen →</Link>
        </div>
        {MOCK_KUNDEN.map(k => (
          <Link key={k.id} href={`/admin/kunden/${k.id}`}
            className="flex items-center justify-between px-5 py-3 border-b border-mid-gray last:border-none hover:bg-bg transition-colors">
            <div>
              <p className="text-sm font-medium">{k.vorname} {k.nachname}</p>
              <p className="text-xs text-warm-gray">{k.email} · PG {k.pflegegrad}</p>
            </div>
            <Badge variant={k.status === 'aktiv' ? 'sage' : k.status === 'pausiert' ? 'amber' : 'gray'}>{k.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
