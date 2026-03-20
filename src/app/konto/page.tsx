import { MOCK_KUNDEN, MOCK_LIEFERUNGEN, MOCK_ANFRAGEN } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

const MOCK_KUNDE = MOCK_KUNDEN[0]

export default function KontoDashboard() {
  const naechste = MOCK_LIEFERUNGEN.find(l => l.kundeId === MOCK_KUNDE.id && l.status === 'geplant')
  const letzteAnfragen = MOCK_ANFRAGEN.filter(a => a.kundeId === MOCK_KUNDE.id && a.status === 'offen')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-1">Guten Tag, {MOCK_KUNDE.vorname}!</h1>
        <p className="text-warm-gray text-sm">Pflegegrad {MOCK_KUNDE.pflegegrad} · {MOCK_KUNDE.krankenkasse}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Aktuelle Box</p>
          {MOCK_KUNDE.box.length > 0 ? (
            <>
              <div className="space-y-1 mb-3">
                {MOCK_KUNDE.box.map(item => (
                  <div key={item.produkt.id} className="text-sm text-dark">{item.produkt.name}</div>
                ))}
              </div>
              <p className="text-xs text-warm-gray">{MOCK_KUNDE.box.reduce((s, i) => s + i.produkt.preis, 0).toFixed(2).replace('.', ',')} € Gesamtwert</p>
            </>
          ) : (
            <p className="text-sm text-warm-gray">Noch keine Box konfiguriert.</p>
          )}
        </div>

        <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Nächste Lieferung</p>
          {naechste ? (
            <>
              <p className="text-2xl font-serif font-semibold mb-1">{naechste.datum}</p>
              <Badge variant="sage">Geplant</Badge>
              <p className="text-xs text-warm-gray mt-2">Stichtag: {MOCK_KUNDE.lieferstichtag}. des Monats</p>
            </>
          ) : (
            <Badge variant="amber">Pausiert</Badge>
          )}
        </div>
      </div>

      {letzteAnfragen.length > 0 && (
        <div className="bg-amber-pale border border-amber rounded-lg p-4">
          <p className="text-amber font-medium text-sm">💬 {letzteAnfragen.length} offene Anfrage(n)</p>
          <p className="text-amber/70 text-xs mt-1">Prüfen Sie Ihre Anfragen unter &bdquo;Anfragen&ldquo;.</p>
        </div>
      )}
    </div>
  )
}
