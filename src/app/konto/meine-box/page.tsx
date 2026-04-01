import { createClient } from '@/lib/supabase/server'
import { getKundenBox } from '@/lib/dal/konto'
import { BoxEditor } from './box-editor'
import type { BoxProdukt } from '@/lib/types'

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

export default async function MeineBoxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const data = user ? await getKundenBox(user.id) : null

  if (!data) return <KeinProfilHinweis />

  const initialBox = (data.box_konfiguration?.produkte as unknown as BoxProdukt[]) ?? []

  return <BoxEditor initialBox={initialBox} />
}
