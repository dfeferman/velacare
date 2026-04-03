'use client'

import { useState } from 'react'
import { FunnelHeader } from '@/components/funnel/funnel-header'
import { Step1Produktauswahl } from './step1-produktauswahl'
import { Step2Daten } from './step2-daten'
import { Step3Bestaetigung } from './step3-bestaetigung'
import type { BoxProdukt, Produkt } from '@/lib/types'
import type { Step2Data } from '@/lib/schemas/register'

interface BeantragenContentProps {
  produkte: Produkt[]
}

export function BeantragenContent({ produkte }: BeantragenContentProps) {
  const [schritt,      setSchritt]      = useState<1 | 2 | 3>(1)
  const [step1,        setStep1]        = useState<BoxProdukt[] | null>(null)
  const [step2,        setStep2]        = useState<Step2Data | null>(null)
  const [unterschrift, setUnterschrift] = useState<string | null>(null)

  const zurueck = schritt > 1 ? () => setSchritt(s => (s - 1) as 1 | 2 | 3) : undefined

  return (
    <div className="min-h-screen flex flex-col bg-v3-background">
      <FunnelHeader schritt={schritt} onZurueck={zurueck} zeigeSchliessen={schritt === 1} />
      <div className="flex-1">
        {schritt === 1 && (
          <Step1Produktauswahl
            produkte={produkte}
            onWeiter={gewaehlteProdukte => { setStep1(gewaehlteProdukte); setSchritt(2) }}
          />
        )}
        {schritt === 2 && (
          <Step2Daten
            onWeiter={(data, sig) => { setStep2(data); setUnterschrift(sig); setSchritt(3) }}
            onZurueck={() => setSchritt(1)}
          />
        )}
        {schritt === 3 && step1 !== null && step2 !== null && unterschrift !== null && (
          <Step3Bestaetigung
            step1={step1}
            step2={step2}
            unterschrift={unterschrift}
            onZurueck={() => setSchritt(2)}
          />
        )}
      </div>
    </div>
  )
}
