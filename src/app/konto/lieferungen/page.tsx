// src/app/konto/lieferungen/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenLieferungen } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

const STATUS_LABEL: Record<string, string> = {
  geplant:        'Geplant',
  in_bearbeitung: 'In Bearbeitung',
  versendet:      'Versendet',
  zugestellt:     'Zugestellt',
  storniert:      'Storniert',
}

const STATUS_VARIANT: Record<string, 'amber' | 'sky' | 'sage' | 'gray'> = {
  geplant:        'amber',
  in_bearbeitung: 'sky',
  versendet:      'sky',
  zugestellt:     'sage',
  storniert:      'gray',
}

export default async function LieferungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const lieferungen = user ? await getKundenLieferungen(user.id) : []

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Lieferungen</h1>
      {lieferungen.length === 0 ? (
        <p className="text-warm-gray text-sm">Noch keine Lieferungen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {lieferungen.map(l => {
            const snapshot = (l.box_snapshot as unknown as BoxProdukt[]) ?? []
            const gesamtwert = snapshot.reduce((sum, bp) => sum + bp.produkt.preis, 0)
            return (
              <div key={l.id}
                className="bg-warm-white rounded-lg border border-mid-gray p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{DE_DATUM.format(l.geplant_fuer)}</p>
                  <p className="text-xs text-warm-gray">
                    {snapshot.length} Produkte · {gesamtwert.toFixed(2).replace('.', ',')} €
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[l.status] ?? 'gray'}>
                  {STATUS_LABEL[l.status] ?? l.status}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
