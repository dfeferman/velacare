import { getAdminDashboard } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireAdmin()
  const { aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden } =
    await getAdminDashboard()

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aktive Kunden',        wert: aktiveKunden,        farbe: 'text-terra' },
          { label: 'Geplante Lieferungen', wert: geplanteLieferungen, farbe: 'text-sky'   },
          { label: 'Offene Anfragen',      wert: offeneAnfragen,      farbe: 'text-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
              {kpi.label}
            </p>
            <p className={`font-serif text-4xl font-semibold ${kpi.farbe}`}>{kpi.wert}</p>
          </div>
        ))}
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray flex justify-between items-center">
          <p className="text-sm font-medium">Neueste Kunden</p>
          <Link href="/admin/kunden" className="text-xs text-terra hover:underline">
            Alle ansehen →
          </Link>
        </div>
        {neuesteKunden.map(k => (
          <Link
            key={k.id}
            href={`/admin/kunden/${k.id}`}
            className="flex items-center justify-between px-5 py-3 border-b border-mid-gray last:border-none hover:bg-bg transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{k.vorname} {k.nachname}</p>
              <p className="text-xs text-warm-gray">PG {k.pflegegrad}</p>
            </div>
            <Badge variant={
              k.lieferung_status === 'aktiv'    ? 'sage'  :
              k.lieferung_status === 'pausiert' ? 'amber' : 'gray'
            }>
              {k.lieferung_status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
