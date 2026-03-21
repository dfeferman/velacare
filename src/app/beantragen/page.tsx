'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FunnelHeader } from '@/components/funnel/funnel-header'
import { Step1Anspruch } from './step1-anspruch'
import { Step2Daten } from './step2-daten'
import { Step3Box } from './step3-box'
import { Step4Bestaetigung } from './step4-bestaetigung'
import type { BoxProdukt } from '@/lib/types'

export default function BeantragenPage() {
  const router = useRouter()
  const [schritt, setSchritt] = useState(1)
  const [box, setBox] = useState<BoxProdukt[]>([])

  const zurueck = schritt > 1 ? () => setSchritt(s => s - 1) : undefined

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <FunnelHeader onZurueck={zurueck} zeigeSchliessen={schritt === 1} />
      <div className="flex-1">
        {schritt === 1 && <Step1Anspruch onWeiter={() => setSchritt(2)} />}
        {schritt === 2 && <Step2Daten onWeiter={() => setSchritt(3)} onZurueck={() => setSchritt(1)} />}
        {schritt === 3 && <Step3Box onWeiter={(b) => { setBox(b); setSchritt(4) }} onZurueck={() => setSchritt(2)} />}
        {schritt === 4 && <Step4Bestaetigung box={box} onBestaetigen={() => router.push('/beantragen/danke')} onZurueck={() => setSchritt(3)} />}
      </div>
    </div>
  )
}
