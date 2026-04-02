// src/app/konto/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKontoDashboard } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import type { BoxProdukt } from '@/lib/types'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

function KeinProfilHinweis() {
  return (
    <div className="bg-amber-pale border border-amber rounded-lg p-6">
      <p className="text-amber font-medium">Profil wird eingerichtet.</p>
      <p className="text-amber/70 text-sm mt-1">
        Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.
      </p>
    </div>
  )
}

export default async function KontoDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getKontoDashboard(user.id) : null

  if (!profile) return <KeinProfilHinweis />

  const produkte = (profile.box_konfiguration?.produkte as unknown as BoxProdukt[]) ?? []
  const gesamtwert = produkte.reduce((s, bp) => s + bp.produkt.preis, 0)
  const naechste = profile.lieferungen[0] ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">
          Guten Tag, {profile.vorname}!
        </h1>
        <p className="text-warm-gray text-sm">
          Pflegegrad {profile.pflegegrad} · {profile.krankenkasse}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Aktuelle Box
          </p>
          {produkte.length > 0 ? (
            <>
              <div className="space-y-1 mb-3">
                {produkte.map((bp, i) => (
                  <div key={i} className="text-sm text-dark">{bp.produkt.name}</div>
                ))}
              </div>
              <p className="text-xs text-warm-gray">
                {gesamtwert.toFixed(2).replace('.', ',')} € Gesamtwert
              </p>
            </>
          ) : (
            <p className="text-sm text-warm-gray">Noch keine Box konfiguriert.</p>
          )}
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Nächste Lieferung
          </p>
          {naechste ? (
            <>
              <p className="text-2xl font-serif font-semibold mb-1">
                {DE_DATUM.format(naechste.geplant_fuer)}
              </p>
              <Badge variant="sage">Geplant</Badge>
              <p className="text-xs text-warm-gray mt-2">
                Stichtag: {profile.lieferstichtag}. des Monats
              </p>
            </>
          ) : (
            <Badge variant="amber">Keine Lieferung geplant</Badge>
          )}
        </div>
      </div>

      {profile.anfragen.length > 0 && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">
            💬 {profile.anfragen.length} offene Anfrage(n)
          </p>
          <p className="text-amber/70 text-xs mt-1">
            Prüfen Sie Ihre Anfragen unter &bdquo;Anfragen&ldquo;.
          </p>
        </div>
      )}
    </div>
  )
}
