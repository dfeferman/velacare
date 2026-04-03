// src/app/actions/konto.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { BoxProdukt } from '@/lib/types'

/**
 * Speichert die neue Box-Konfiguration des eingeloggten Kunden.
 * WHERE nutzt immer `kunde_id: profile.id` (server-seitig, nie client-seitige ID).
 */
export async function updateKundenBox(produkte: BoxProdukt[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt.' }

  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: user.id },
    select: { id: true },
  })
  if (!profile) return { error: 'Kein Profil gefunden.' }

  // Ownership-Invariante: WHERE { kunde_id: profile.id } — nie eine client-seitige Box-ID
  const gesamtpreis = produkte.reduce((sum, bp) => sum + bp.produkt.preis * bp.anzahl, 0)

  await prisma.boxKonfiguration.update({
    where: { kunde_id: profile.id },
    data:  {
      produkte:    produkte as object,
      gesamtpreis,
    },
  })

  return {}
}

const BETREFF_MAP = {
  box:       'Anfrage: Box-Inhalt',
  lieferung: 'Anfrage: Lieferung',
  adresse:   'Anfrage: Adresse',
  sonstiges: 'Anfrage: Sonstiges',
} as const

type AnfrageKategorie = keyof typeof BETREFF_MAP

/** Legt eine neue Anfrage für den eingeloggten Kunden an. */
export async function createAnfrage(
  kategorie: AnfrageKategorie,
  nachricht: string,
): Promise<{ error?: string }> {
  if (nachricht.trim().length < 5) return { error: 'Nachricht zu kurz (min. 5 Zeichen).' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt.' }

  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: user.id },
    select: { id: true },
  })
  if (!profile) return { error: 'Kein Profil gefunden.' }

  await prisma.anfrage.create({
    data: {
      kunde_id:  profile.id,
      kategorie,
      betreff:   BETREFF_MAP[kategorie],
      nachricht: nachricht.trim(),
      status:    'offen',
    },
  })

  return {}
}
