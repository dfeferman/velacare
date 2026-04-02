import type { Produkt } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface ProduktKarteProps {
  produkt: Produkt
  ausgewaehlt: boolean
  gewaehlteMenge: string | null
  budgetWuerdeUeberschritten: boolean
  onToggle: (produkt: Produkt, menge: string | null) => void
}

export function ProduktKarte({ produkt, ausgewaehlt, gewaehlteMenge, budgetWuerdeUeberschritten, onToggle }: ProduktKarteProps) {
  const deaktiviert = !ausgewaehlt && budgetWuerdeUeberschritten

  return (
    <div className={`rounded-lg border bg-warm-white transition-all ${
      ausgewaehlt ? 'border-terra ring-2 ring-terra-pale' :
      deaktiviert ? 'border-mid-gray opacity-50' :
      'border-mid-gray hover:border-terra-light'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="terra">{produkt.kategorie}</Badge>
        </div>
        <h4 className="font-medium text-sm text-dark mb-1">{produkt.name}</h4>
        <p className="text-xs text-warm-gray leading-relaxed mb-3">{produkt.beschreibung}</p>

        {produkt.mengenOptionen && ausgewaehlt && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {produkt.mengenOptionen.map(opt => (
              <button
                key={opt}
                onClick={() => onToggle(produkt, opt)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  gewaehlteMenge === opt
                    ? 'bg-terra text-white border-terra'
                    : 'border-mid-gray text-warm-gray hover:border-terra'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onToggle(produkt, produkt.mengenOptionen?.[1] ?? null)}
          disabled={deaktiviert}
          className={`w-full py-2 text-xs font-medium rounded-md transition-colors ${
            ausgewaehlt
              ? 'bg-terra text-white hover:bg-terra-dark'
              : deaktiviert
                ? 'bg-bg text-warm-gray cursor-not-allowed'
                : 'bg-terra-pale text-terra hover:bg-terra hover:text-white'
          }`}
        >
          {ausgewaehlt ? '✓ Ausgewählt — Entfernen' : deaktiviert ? 'Budget reicht nicht' : 'Zur Box hinzufügen'}
        </button>
      </div>
    </div>
  )
}
