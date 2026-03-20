'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fortschrittsbalken } from '@/components/funnel/fortschrittsbalken'
import { Step1Anspruch } from './step1-anspruch'
import { Step2Daten } from './step2-daten'
import { Step3Box } from './step3-box'
import { Step4Bestaetigung } from './step4-bestaetigung'
import type { BoxProdukt } from '@/lib/types'

const SCHRITTE = ['Anspruch', 'Ihre Daten', 'Box wählen', 'Bestätigung']

export default function BeantragenPage() {
  const router = useRouter()
  const [schritt, setSchritt] = useState(1)
  const [box, setBox] = useState<BoxProdukt[]>([])

  return (
    <div className="min-h-screen bg-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-semibold mb-2">Pflegebox beantragen</h1>
          <p className="text-warm-gray text-sm">Kostenlos, dauert nur 3 Minuten.</p>
        </div>
        <Fortschrittsbalken aktuellerSchritt={schritt} schritte={SCHRITTE} />

        {schritt === 1 && <Step1Anspruch onWeiter={() => setSchritt(2)} />}
        {schritt === 2 && <Step2Daten onWeiter={() => setSchritt(3)} onZurueck={() => setSchritt(1)} />}
        {schritt === 3 && <Step3Box onWeiter={(b) => { setBox(b); setSchritt(4) }} onZurueck={() => setSchritt(2)} />}
        {schritt === 4 && <Step4Bestaetigung box={box} onBestaetigen={() => router.push('/beantragen/danke')} onZurueck={() => setSchritt(3)} />}
      </div>
    </div>
  )
}
