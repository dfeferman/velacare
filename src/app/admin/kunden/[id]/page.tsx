import { MOCK_KUNDEN, MOCK_LIEFERUNGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function KundenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kunde = MOCK_KUNDEN.find(k => k.id === id)
  if (!kunde) notFound()

  const lieferungen = MOCK_LIEFERUNGEN.filter(l => l.kundeId === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kunden" className="text-xs text-warm-gray hover:text-dark">← Zurück</Link>
        <h1 className="font-serif text-3xl font-semibold">{kunde.vorname} {kunde.nachname}</h1>
        <Badge variant={kunde.status === 'aktiv' ? 'sage' : 'amber'}>{kunde.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Stammdaten</p>
          <dl className="space-y-2 text-sm">
            {[['E-Mail', kunde.email], ['Pflegegrad', `PG ${kunde.pflegegrad}`], ['Adresse', kunde.adresse], ['Krankenkasse', kunde.krankenkasse], ['Lieferstichtag', `${kunde.lieferstichtag}. des Monats`]].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="text-warm-gray w-28 flex-shrink-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Aktuelle Box</p>
          {kunde.box.length > 0 ? (
            <div className="space-y-1">
              {kunde.box.map(item => (
                <div key={item.produkt.id} className="flex justify-between text-sm">
                  <span>{item.produkt.name}</span>
                  <span className="text-terra">{item.produkt.preis.toFixed(2).replace('.', ',')} €</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-warm-gray">Keine Box konfiguriert.</p>}
        </div>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray">
          <p className="text-sm font-medium">Lieferungen</p>
        </div>
        {lieferungen.map(l => (
          <div key={l.id} className="flex justify-between items-center px-5 py-3 border-b border-mid-gray last:border-none">
            <span className="text-sm">{l.datum}</span>
            <span className="text-sm text-warm-gray">{l.gesamtwert.toFixed(2).replace('.', ',')} €</span>
            <Badge variant={l.status === 'geliefert' ? 'sage' : 'amber'}>{l.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
