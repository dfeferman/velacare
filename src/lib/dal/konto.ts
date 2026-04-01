// src/lib/dal/konto.ts
import { prisma } from '@/lib/prisma'

/** Dashboard: KundenProfile + nächste geplante Lieferung + Anzahl offener Anfragen */
export async function getKontoDashboard(userId: string) {
  return prisma.kundenProfile.findUnique({
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
}

/** Meine Box: KundenProfile + BoxKonfiguration */
export async function getKundenBox(userId: string) {
  return prisma.kundenProfile.findUnique({
    where:   { user_id: userId },
    include: { box_konfiguration: true },
  })
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
  return prisma.kundenProfile.findUnique({
    where: { user_id: userId },
  })
}
