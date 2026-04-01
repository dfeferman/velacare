'use client'

import { useState } from 'react'
import { FunnelHeader } from '@/components/funnel/funnel-header'
import { Step1Produktauswahl } from './step1-produktauswahl'
import { Step2Daten } from './step2-daten'
import { Step3Bestaetigung } from './step3-bestaetigung'
import type { BoxProdukt } from '@/lib/types'
import type { Step2Data } from '@/lib/schemas/register'

export default function BeantragenPage() {
  const [schritt, setSchritt] = useState<1 | 2 | 3>(1)
  const [step1, setStep1]     = useState<BoxProdukt[] | null>(null)
  const [step2, setStep2]     = useState<Step2Data | null>(null)

  const zurueck = schritt > 1 ? () => setSchritt(s => (s - 1) as 1 | 2 | 3) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <FunnelHeader onZurueck={zurueck} zeigeSchliessen={schritt === 1} />
      <div className="flex-1">
        {schritt === 1 && (
          <Step1Produktauswahl
            onWeiter={produkte => { setStep1(produkte); setSchritt(2) }}
          />
        )}
        {schritt === 2 && (
          <Step2Daten
            onWeiter={data => { setStep2(data); setSchritt(3) }}
            onZurueck={() => setSchritt(1)}
          />
        )}
        {schritt === 3 && step1 !== null && step2 !== null && (
          <Step3Bestaetigung
            step1={step1}
            step2={step2}
            onZurueck={() => setSchritt(2)}
          />
        )}
      </div>
    </div>
  )
}
