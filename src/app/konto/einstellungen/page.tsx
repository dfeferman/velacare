// src/app/konto/einstellungen/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getKundenEinstellungen } from '@/lib/dal/konto'
import { EinstellungenClient } from './einstellungen-client'

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

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getKundenEinstellungen(user.id) : null

  if (!profile || !user) return <KeinProfilHinweis />

  const adresse = `${profile.strasse}, ${profile.plz} ${profile.ort}`

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold mb-6">Einstellungen</h1>
      <EinstellungenClient
        vorname={profile.vorname}
        nachname={profile.nachname}
        email={user.email ?? ''}
        adresse={adresse}
        krankenkasse={profile.krankenkasse}
      />
    </>
  )
}
