import { createClient } from '@/lib/supabase/server'
import { getKundenAnfragen } from '@/lib/dal/konto'
import { Badge } from '@/components/ui/badge'
import { AnfrageFormular } from './anfrage-formular'

const DE_DATUM = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric',
})

const KAT_LABEL: Record<string, string> = {
  box:       'Box-Inhalt',
  lieferung: 'Lieferung',
  adresse:   'Adresse',
  sonstiges: 'Sonstiges',
}

export default async function AnfragenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const anfragen = user ? await getKundenAnfragen(user.id) : []

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Anfragen</h1>
      <AnfrageFormular />
      <div className="space-y-3">
        {anfragen.map(a => (
          <div key={a.id} className="bg-warm-white rounded-lg border border-mid-gray p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="terra">{KAT_LABEL[a.kategorie] ?? a.kategorie}</Badge>
              <Badge variant={a.status === 'offen' ? 'amber' : 'sage'}>
                {a.status === 'offen' ? 'Offen' : 'Beantwortet'}
              </Badge>
            </div>
            <p className="text-sm mb-2">{a.nachricht}</p>
            {a.antwort && (
              <div className="bg-sage-pale rounded p-3 text-xs text-sage">
                <strong>Velacare:</strong> {a.antwort}
              </div>
            )}
            <p className="text-xs text-warm-gray mt-2">
              {DE_DATUM.format(a.erstellt_am)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
