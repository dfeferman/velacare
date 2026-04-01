// src/app/admin/kunden/[id]/page.tsx
import { getAdminKundeDetail } from '@/lib/dal/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { BoxProdukt } from '@/lib/types'

const fmt = new Intl.DateTimeFormat('de-DE')

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const profile = await getAdminKundeDetail(id)
  if (!profile) notFound()

  const adminClient = createAdminClient()
  const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(
    profile.user_id,
  )
  const email = authUser?.email ?? '—'

  const box = (profile.box_konfiguration?.produkte ?? []) as unknown as BoxProdukt[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kunden" className="text-xs text-warm-gray hover:text-dark">
          ← Zurück
        </Link>
        <h1 className="font-serif text-3xl font-semibold">
          {profile.vorname} {profile.nachname}
        </h1>
        <Badge variant={profile.lieferung_status === 'aktiv' ? 'sage' : 'amber'}>
          {profile.lieferung_status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Stammdaten
          </p>
          <dl className="space-y-2 text-sm">
            {(
              [
                ['E-Mail',         email],
                ['Pflegegrad',     `PG ${profile.pflegegrad}`],
                ['Adresse',        `${profile.strasse}, ${profile.plz} ${profile.ort}`],
                ['Krankenkasse',   profile.krankenkasse],
                ['Lieferstichtag', `${profile.lieferstichtag}. des Monats`],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="text-warm-gray w-28 flex-shrink-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Aktuelle Box
          </p>
          {box.length > 0 ? (
            <div className="space-y-1">
              {box.map(item => (
                <div key={item.produkt.id} className="flex justify-between text-sm">
                  <span>{item.produkt.name}</span>
                  <span className="text-terra">
                    {item.produkt.preis.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-gray">Keine Box konfiguriert.</p>
          )}
        </div>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray">
        <div className="px-5 py-3 border-b border-mid-gray">
          <p className="text-sm font-medium">Lieferungen</p>
        </div>
        {profile.lieferungen.map(l => {
          const snapshot = (l.box_snapshot ?? []) as unknown as BoxProdukt[]
          const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
          return (
            <div
              key={l.id}
              className="flex justify-between items-center px-5 py-3 border-b border-mid-gray last:border-none"
            >
              <span className="text-sm">{fmt.format(l.geplant_fuer)}</span>
              <span className="text-sm text-warm-gray">
                {gesamtwert.toFixed(2).replace('.', ',')} € · {snapshot.length} Produkte
              </span>
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
