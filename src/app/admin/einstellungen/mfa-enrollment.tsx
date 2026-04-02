'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EnrollStep = 'idle' | 'qr' | 'verify' | 'done' | 'error'

export function MfaEnrollment() {
  const [step, setStep] = useState<EnrollStep>('idle')
  const [qrCode, setQrCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  async function startEnrollment() {
    setErrorMsg('')
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) {
      setErrorMsg('Enrollment fehlgeschlagen: ' + (error?.message ?? 'Unbekannter Fehler'))
      setStep('error')
      return
    }
    setQrCode(data.totp.qr_code)
    setFactorId(data.id)
    setStep('qr')
  }

  async function startChallenge() {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId })
    if (error || !data) {
      setErrorMsg('Challenge fehlgeschlagen: ' + (error?.message ?? ''))
      return
    }
    setChallengeId(data.id)
    setStep('verify')
  }

  async function verifyCode() {
    setErrorMsg('')
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: totpCode })
    if (error) {
      setErrorMsg('Code ungültig: ' + error.message)
      return
    }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
        <p className="text-sm font-medium text-primary">2-Faktor-Authentifizierung ist jetzt aktiv.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-dark">2-Faktor-Authentifizierung</h3>
        <p className="text-sm text-on-surface-variant mt-1">
          Schütze deinen Admin-Account mit einem TOTP-Authenticator (z.B. Google Authenticator).
        </p>
      </div>

      {step === 'idle' && (
        <button onClick={startEnrollment} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
          2FA einrichten
        </button>
      )}

      {step === 'qr' && (
        <div className="space-y-4">
          <p className="text-sm text-dark">Scanne diesen QR-Code mit deiner Authenticator-App:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="TOTP QR-Code" className="w-48 h-48" />
          <button onClick={startChallenge} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
            Weiter → Code eingeben
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-3">
          <p className="text-sm text-dark">Gib den 6-stelligen Code aus deiner App ein:</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            className="w-32 px-3 py-2 border border-outline rounded-md text-center text-lg tracking-widest"
            placeholder="000000"
          />
          <button onClick={verifyCode} className="block px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
            Bestätigen
          </button>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        </div>
      )}

      {step === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  )
}
