// src/lib/dal/admin.ts
import { prisma } from '@/lib/prisma'
import { decryptKundenProfile } from '@/lib/crypto/field-encryption'

// Dashboard: KPIs + neueste 5 Kunden
export async function getAdminDashboard() {
  const neuesteKundenQuery = prisma.kundenProfile.findMany({
    orderBy: { id: 'desc' },
    take: 5,
    select: {
      id:               true,
      vorname:          true,
      nachname:         true,
      pflegegrad:       true,
      lieferung_status: true,
    },
  })

  const [aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKundenRaw] =
    await prisma.$transaction([
      prisma.kundenProfile.count({ where: { lieferung_status: 'aktiv' } }),
      prisma.lieferung.count({ where: { status: 'geplant' } }),
      prisma.anfrage.count({ where: { status: 'offen' } }),
      neuesteKundenQuery,
    ])

  type NeusterKunde = Awaited<typeof neuesteKundenQuery>[number]
  const neuesteKunden = (neuesteKundenRaw as NeusterKunde[]).map((k) => {
    const dec = decryptKundenProfile({
      vorname:      k.vorname,
      nachname:     k.nachname,
      geburtsdatum: '',   // not selected — placeholder for type
      pflegegrad:   k.pflegegrad,
    })
    return {
      ...k,
      vorname:    dec.vorname,
      nachname:   dec.nachname,
      pflegegrad: Number(dec.pflegegrad),
    }
  })

  return { aktiveKunden, geplanteLieferungen, offeneAnfragen, neuesteKunden }
}

// Kunden-Liste: alle KundenProfile, neueste zuerst
export async function getAdminKunden() {
  const raw = await prisma.kundenProfile.findMany({
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

  return raw.map((k) => {
    const dec = decryptKundenProfile({
      vorname:      k.vorname,
      nachname:     k.nachname,
      geburtsdatum: '',   // not selected — placeholder for type
      pflegegrad:   k.pflegegrad,
    })
    return {
      ...k,
      vorname:    dec.vorname,
      nachname:   dec.nachname,
      pflegegrad: Number(dec.pflegegrad),
    }
  })
}

// Kunden-Detail: Stammdaten + Box + Lieferungen
export async function getAdminKundeDetail(profilId: string) {
  const raw = await prisma.kundenProfile.findUnique({
    where:   { id: profilId },
    include: {
      box_konfiguration: true,
      lieferungen: { orderBy: { geplant_fuer: 'desc' } },
    },
  })
  if (!raw) return null

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

// Lieferungen: alle Lieferungen + Kundenname
export async function getAdminLieferungen() {
  const raw = await prisma.lieferung.findMany({
    orderBy: { geplant_fuer: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })

  return raw.map((l) => {
    const dec = decryptKundenProfile({
      vorname:      l.kunde.vorname,
      nachname:     l.kunde.nachname,
      geburtsdatum: '',   // not selected — placeholder for type
      pflegegrad:   '0',  // not selected — placeholder for type
    })
    return {
      ...l,
      kunde: {
        vorname:  dec.vorname,
        nachname: dec.nachname,
      },
    }
  })
}

// Anfragen: alle Anfragen + Kundenname
export async function getAdminAnfragen() {
  const raw = await prisma.anfrage.findMany({
    orderBy: { erstellt_am: 'desc' },
    include: { kunde: { select: { vorname: true, nachname: true } } },
  })

  return raw.map((a) => {
    const dec = decryptKundenProfile({
      vorname:      a.kunde.vorname,
      nachname:     a.kunde.nachname,
      geburtsdatum: '',   // not selected — placeholder for type
      pflegegrad:   '0',  // not selected — placeholder for type
    })
    return {
      ...a,
      kunde: {
        vorname:  dec.vorname,
        nachname: dec.nachname,
      },
    }
  })
}

// Produkte: alle Produkte, nach Sortierung dann Name
export async function getAdminProdukte() {
  return prisma.produkt.findMany({
    orderBy: [{ sortierung: 'asc' }, { name: 'asc' }],
    select: {
      id:                   true,
      name:                 true,
      kategorie:            true,
      preis:                true,
      beschreibung:         true,
      hersteller:           true,
      pflichtkennzeichnung: true,
      aktiv:                true,
      sortierung:           true,
      varianten:            true,
    },
  })
}
