import { MOCK_PRODUKTE } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProduktePublicPage() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Unser Sortiment</p>
      <h1 className="font-serif text-5xl font-semibold text-center mb-4">Alle Produkte</h1>
      <p className="text-warm-gray text-center max-w-xl mx-auto mb-12">Wählen Sie bei der Registrierung genau das aus, was Sie monatlich brauchen. Ihr Budget: bis zu 42 € — vollständig von der Pflegekasse übernommen.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {MOCK_PRODUKTE.map(p => (
          <div key={p.id} className="bg-warm-white rounded-lg border border-mid-gray p-5">
            <Badge variant="terra" className="mb-3">{p.kategorie}</Badge>
            <h3 className="font-medium mb-1">{p.name}</h3>
            <p className="text-xs text-warm-gray mb-3">{p.beschreibung}</p>
            <p className="text-sm font-medium text-terra">{p.preis.toFixed(2).replace('.', ',')} €</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Box zusammenstellen</Link>
        </Button>
      </div>
    </div>
  )
}
