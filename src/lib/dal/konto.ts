// src/lib/dal/konto.ts
import { prisma } from '@/lib/prisma'
import { decryptKundenProfile } from '@/lib/crypto/field-encryption'

/** Decrypt sensitive fields on a KundenProfile and convert pflegegrad back to number */
function decryptProfile<T extends {
  vorname: string
  nachname: string
  geburtsdatum: string
  pflegegrad: string
}>(raw: T): Omit<T, 'pflegegrad'> & { pflegegrad: number } {
  const dec = decryptKundenProfile({
    vorname:      raw.vorname,
    nachname:     raw.nachname,
    geburtsdatum: raw.geburtsdatum,
    pflegegrad:   raw.pflegegrad,
  })
  return {
    ...raw,
    vorname:      dec.vorname,
    nachname:     dec.nachname,
    geburtsdatum: dec.geburtsdatum,
    pflegegrad:   Number(dec.pflegegrad),
  }
}

/** Dashboard: KundenProfile + nächste geplante Lieferung + Anzahl offener Anfragen */
export async function getKontoDashboard(userId: string) {
  const raw = await prisma.kundenProfile.findUnique({
    where: { user_id: userId },
    include: {
      box_konfiguration: true,
      lieferungen: {
        where:   { status: 'geplant' },
        orderBy: { geplant_fuer: 'asc' },
        take:    1,
      },
      anfragen: {
        where:  { status: 'offen' },
        select: { id: true },
      },
    },
  })
  if (!raw) return null
  return decryptProfile(raw)
}

/** Meine Box: KundenProfile + BoxKonfiguration */
export async function getKundenBox(userId: string) {
  const raw = await prisma.kundenProfile.findUnique({
    where:   { user_id: userId },
    include: { box_konfiguration: true },
  })
  if (!raw) return null
  return decryptProfile(raw)
}

/** Lieferungen: alle Lieferungen des Kunden, absteigend nach Datum */
export async function getKundenLieferungen(userId: string) {
  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: userId },
    select: { id: true },
  })
  if (!profile) return []
  return prisma.lieferung.findMany({
    where:   { kunde_id: profile.id },
    orderBy: { geplant_fuer: 'desc' },
  })
}

/** Anfragen: alle Anfragen des Kunden, absteigend nach Erstelldatum */
export async function getKundenAnfragen(userId: string) {
  const profile = await prisma.kundenProfile.findUnique({
    where:  { user_id: userId },
    select: { id: true },
  })
  if (!profile) return []
  return prisma.anfrage.findMany({
    where:   { kunde_id: profile.id },
    orderBy: { erstellt_am: 'desc' },
  })
}

/** Einstellungen: Kontaktdaten (read-only in Phase 3) */
export async function getKundenEinstellungen(userId: string) {
  const raw = await prisma.kundenProfile.findUnique({
    where: { user_id: userId },
  })
  if (!raw) return null
  return decryptProfile(raw)
}
