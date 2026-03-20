'use client'

import { useState } from 'react'
import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { MOCK_PRODUKTE, MOCK_KUNDEN } from '@/lib/mock-data'
import type { BoxProdukt } from '@/lib/types'

export default function MeineBoxPage() {
  const [gespeichert, setGespeichert] = useState(false)

  const handleSave = (_box: BoxProdukt[]) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setGespeichert(true)
    setTimeout(() => setGespeichert(false), 3000)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Meine Box</h1>
          <p className="text-warm-gray text-sm">Änderungen gelten ab der nächsten Lieferung.</p>
        </div>
        {gespeichert && (
          <div className="bg-sage-pale text-sage text-sm px-4 py-2 rounded-lg border border-sage-light">
            ✓ Gespeichert
          </div>
        )}
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        initialBox={MOCK_KUNDEN[0].box}
        onSave={handleSave}
        saveLabel="Änderungen speichern"
      />
    </div>
  )
}
