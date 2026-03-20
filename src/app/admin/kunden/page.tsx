import Link from 'next/link'
import { MOCK_KUNDEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export default function KundenListePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Kunden</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-mid-gray">
            <tr>
              {['Name', 'E-Mail', 'Pflegegrad', 'Krankenkasse', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium tracking-widest uppercase text-warm-gray">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_KUNDEN.map(k => (
              <tr key={k.id} className="border-b border-mid-gray last:border-none hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium">{k.vorname} {k.nachname}</td>
                <td className="px-4 py-3 text-warm-gray">{k.email}</td>
                <td className="px-4 py-3">PG {k.pflegegrad}</td>
                <td className="px-4 py-3 text-warm-gray">{k.krankenkasse}</td>
                <td className="px-4 py-3">
                  <Badge variant={k.status === 'aktiv' ? 'sage' : k.status === 'pausiert' ? 'amber' : 'gray'}>{k.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/kunden/${k.id}`} className="text-terra text-xs hover:underline">Detail →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
