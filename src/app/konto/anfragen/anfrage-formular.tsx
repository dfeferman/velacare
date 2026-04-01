'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createAnfrage } from '@/app/actions/konto'

type Kategorie = 'box' | 'lieferung' | 'adresse' | 'sonstiges'

const KATEGORIEN: { value: Kategorie; label: string }[] = [
  { value: 'box',       label: 'Box-Inhalt' },
  { value: 'lieferung', label: 'Lieferung' },
  { value: 'adresse',   label: 'Adresse' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export function AnfrageFormular() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [kat, setKat] = useState<Kategorie>('sonstiges')
  const [nachricht, setNachricht] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [gesendet, setGesendet] = useState(false)

  const handleSubmit = () => {
    setFehler(null)
    setGesendet(false)
    startTransition(async () => {
      const result = await createAnfrage(kat, nachricht)
      if (result.error) {
        setFehler(result.error)
      } else {
        setNachricht('')
        setGesendet(true)
        router.refresh()
        setTimeout(() => setGesendet(false), 3000)
      }
    })
  }

  return (
    <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
      <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
        Neue Anfrage
      </p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {KATEGORIEN.map(k => (
          <button key={k.value} onClick={() => setKat(k.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              kat === k.value
                ? 'bg-terra text-white border-terra'
                : 'border-mid-gray text-warm-gray hover:border-terra'
            }`}>
            {k.label}
          </button>
        ))}
      </div>
      <textarea
        value={nachricht}
        onChange={e => setNachricht(e.target.value)}
        placeholder="Ihre Nachricht an Velacare..."
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra/30"
      />
      {fehler && <p className="text-danger text-xs mt-2">{fehler}</p>}
      {gesendet && <p className="text-sage text-xs mt-2">✓ Anfrage gesendet</p>}
      <Button
        variant="primary"
        className="mt-3"
        onClick={handleSubmit}
        disabled={nachricht.trim().length < 5 || isPending}
      >
        {isPending ? 'Senden...' : 'Anfrage senden'}
      </Button>
    </div>
  )
}
