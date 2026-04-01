import Link from 'next/link'
import { getAdminKunden } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { Badge } from '@/components/ui/badge'

export default async function KundenListePage() {
  await requireAdmin()
  const kunden = await getAdminKunden()

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Kunden</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-mid-gray">
            <tr>
              {['Name', 'Pflegegrad', 'Krankenkasse', 'Status', ''].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium tracking-widest uppercase text-warm-gray"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kunden.map(k => (
              <tr
                key={k.id}
                className="border-b border-mid-gray last:border-none hover:bg-bg transition-colors"
              >
                <td className="px-4 py-3 font-medium">{k.vorname} {k.nachname}</td>
                <td className="px-4 py-3">PG {k.pflegegrad}</td>
                <td className="px-4 py-3 text-warm-gray">{k.krankenkasse}</td>
                <td className="px-4 py-3">
                  <Badge variant={
                    k.lieferung_status === 'aktiv'    ? 'sage'  :
                    k.lieferung_status === 'pausiert' ? 'amber' : 'gray'
                  }>
                    {k.lieferung_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/kunden/${k.id}`} className="text-terra text-xs hover:underline">
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
