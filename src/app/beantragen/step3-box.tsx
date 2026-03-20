'use client'

import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { Button } from '@/components/ui/button'
import { MOCK_PRODUKTE } from '@/lib/mock-data'
import type { BoxProdukt } from '@/lib/types'

interface Step3Props {
  onWeiter: (box: BoxProdukt[]) => void
  onZurueck: () => void
}

export function Step3Box({ onWeiter, onZurueck }: Step3Props) {
  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" onClick={onZurueck} className="mb-4">← Zurück</Button>
        <p className="text-warm-gray text-sm max-w-xl">Stellen Sie jetzt Ihre persönliche Box zusammen. Ihr Budget von 42 € wird live aktualisiert.</p>
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        onSave={onWeiter}
        saveLabel="Box bestätigen →"
      />
    </div>
  )
}
