// src/app/konto/einstellungen/einstellungen-client.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EinstellungenClientProps {
  vorname: string
  nachname: string
  email: string
  adresse: string       // zusammengesetzt: "Musterstr. 1, 12345 Berlin"
  krankenkasse: string
}

export function EinstellungenClient({
  vorname, nachname, email, adresse, krankenkasse,
}: EinstellungenClientProps) {
  const [loeschDialog, setLoeschDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Kontaktdaten
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-warm-gray">Name:</span><br />{vorname} {nachname}</div>
          <div><span className="text-warm-gray">E-Mail:</span><br />{email}</div>
          <div><span className="text-warm-gray">Adresse:</span><br />{adresse}</div>
          <div><span className="text-warm-gray">Krankenkasse:</span><br />{krankenkasse}</div>
        </div>
        <Button variant="secondary" className="text-xs">Daten ändern (Demo)</Button>
      </div>

      <div className="bg-warm-white rounded-lg border border-mid-gray p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Passwort
        </p>
        <Button variant="secondary" className="text-xs">Passwort ändern (Demo)</Button>
      </div>

      <div className="bg-danger-pale rounded-lg border border-danger/20 p-5">
        <p className="text-xs font-medium tracking-widest uppercase text-danger mb-2">
          Gefahrenzone
        </p>
        <p className="text-sm text-warm-gray mb-4">
          Ihr Account und alle Daten werden innerhalb von 30 Tagen gelöscht (DSGVO).
        </p>
        {!loeschDialog ? (
          <Button variant="danger" onClick={() => setLoeschDialog(true)}>
            Account löschen
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-danger">
              Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setLoeschDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="danger">
                Ja, Account löschen (Demo)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
