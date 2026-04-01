// src/lib/dal/admin.ts
import { prisma } from '@/lib/prisma'

// Dashboard: KPIs + neueste 5 Kunden
export async function getAdminDashboard() {
  const [aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden] =
    await prisma.$transaction([
      prisma.kundenProfile.count({ where: { lieferung_status: 'aktiv' } }),
      prisma.lieferung.count({ where: { status: 'geplant' } }),
      prisma.anfrage.count({ where: { status: 'offen' } }),
      prisma.kundenProfile.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: {
          id:               true,
          vorname:          true,
          nachname:         true,
          pflegegrad:       true,
          lieferung_status: true,
        },
      }),
    ])
  return { aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden }
}

// Kunden-Liste: alle KundenProfile, neueste zuerst
export async function getAdminKunden() {
  return prisma.kundenProfile.findMany({
    orderBy: { id: 'desc' },
    select: {
      id:               true,
      vorname:          true,
      nachname:         true,
      pflegegrad:       true,
      krankenkasse:     true,
      lieferung_status: true,
    },
  })
}

// Kunden-Detail: Stammdaten + Box + Lieferungen
export async function getAdminKundeDetail(profilId: string) {
  return prisma.kundenProfile.findUnique({
    where:   { id: profilId },
    include: {
      box_konfiguration: true,
      lieferungen: { orderBy: { geplant_fuer: 'desc' } },
    },
  })
}

// Lieferungen: alle Lieferungen + Kundenname
export async function getAdminLieferungen() {
  return prisma.lieferung.findMany({
    orderBy: { geplant_fuer: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })
}

// Anfragen: alle Anfragen + Kundenname
export async function getAdminAnfragen() {
  return prisma.anfrage.findMany({
    orderBy: { erstellt_am: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })
}

// Produkte: alle Produkte, alphabetisch
export async function getAdminProdukte() {
  return prisma.produkt.findMany({ orderBy: { name: 'asc' } })
}
