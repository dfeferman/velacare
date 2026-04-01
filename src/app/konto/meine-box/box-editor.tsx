'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Konfigurator } from '@/components/box-konfigurator/konfigurator'
import { MOCK_PRODUKTE } from '@/lib/mock-data'
import { updateKundenBox } from '@/app/actions/konto'
import type { BoxProdukt } from '@/lib/types'

interface BoxEditorProps {
  initialBox: BoxProdukt[]
}

export function BoxEditor({ initialBox }: BoxEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fehler, setFehler] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState(false)

  const handleSave = (box: BoxProdukt[]) => {
    setFehler(null)
    setGespeichert(false)
    startTransition(async () => {
      const result = await updateKundenBox(box)
      if (result.error) {
        setFehler(result.error)
      } else {
        setGespeichert(true)
        router.refresh()
        setTimeout(() => setGespeichert(false), 3000)
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Meine Box</h1>
          <p className="text-warm-gray text-sm">
            Änderungen gelten ab der nächsten Lieferung.
          </p>
        </div>
        {gespeichert && (
          <div className="bg-sage-pale text-sage text-sm px-4 py-2 rounded-lg border border-sage-light">
            ✓ Gespeichert
          </div>
        )}
        {fehler && (
          <div className="bg-danger-pale text-danger text-sm px-4 py-2 rounded-lg border border-danger/20">
            {fehler}
          </div>
        )}
      </div>
      <Konfigurator
        produkte={MOCK_PRODUKTE}
        initialBox={initialBox}
        onSave={handleSave}
        saveLabel={isPending ? 'Speichern...' : 'Änderungen speichern'}
      />
    </div>
  )
}
