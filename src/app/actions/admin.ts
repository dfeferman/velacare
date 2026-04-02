// src/app/actions/admin.ts
'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAuditLog } from '@/lib/dal/audit'

export async function createProdukt(): Promise<{ error?: string }> {
  try {
    const adminUser = await requireAdmin()
    const neuesProdukt = await prisma.produkt.create({
      data: {
        name:         'Neues Produkt',
        preis:        5.00,
        kategorie:    'sonstiges',
        beschreibung: 'Beschreibung',
        bild_url:     '',
        hersteller:   '—',
        aktiv:        true,
      },
    })
    try {
      await writeAuditLog({
        aktion:      'produkt_erstellt',
        entitaet:    'Produkt',
        entitaet_id: neuesProdukt.id,
        userId:      adminUser.id,
        neuWert:     neuesProdukt as unknown as object,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (createProdukt):', e)
    }
    return {}
  } catch {
    return { error: 'Produkt konnte nicht erstellt werden.' }
  }
}

export async function updateProduktName(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  try {
    const adminUser = await requireAdmin()
    if (name.trim().length < 1) return { error: 'Name darf nicht leer sein.' }
    const vorherProdukt = await prisma.produkt.findUnique({ where: { id } })
    const aktualisiert = await prisma.produkt.update({ where: { id }, data: { name: name.trim() } })
    try {
      await writeAuditLog({
        aktion:      'produkt_aktualisiert',
        entitaet:    'Produkt',
        entitaet_id: id,
        userId:      adminUser.id,
        altWert:     vorherProdukt as unknown as object ?? undefined,
        neuWert:     aktualisiert as unknown as object,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (updateProduktName):', e)
    }
    return {}
  } catch {
    return { error: 'Name konnte nicht aktualisiert werden.' }
  }
}

export async function toggleProduktAktiv(
  id: string,
  aktiv: boolean,
): Promise<{ error?: string }> {
  try {
    const adminUser = await requireAdmin()
    const vorherProdukt = await prisma.produkt.findUnique({ where: { id } })
    const aktualisiert = await prisma.produkt.update({ where: { id }, data: { aktiv } })
    try {
      await writeAuditLog({
        aktion:      'produkt_aktualisiert',
        entitaet:    'Produkt',
        entitaet_id: id,
        userId:      adminUser.id,
        altWert:     vorherProdukt as unknown as object ?? undefined,
        neuWert:     aktualisiert as unknown as object,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (toggleProduktAktiv):', e)
    }
    return {}
  } catch {
    return { error: 'Status konnte nicht geändert werden.' }
  }
}

export async function deleteProdukt(id: string): Promise<{ error?: string }> {
  try {
    const adminUser = await requireAdmin()
    const geloeschtesProdukt = await prisma.produkt.findUnique({ where: { id } })
    await prisma.produkt.delete({ where: { id } })
    try {
      await writeAuditLog({
        aktion:      'produkt_geloescht',
        entitaet:    'Produkt',
        entitaet_id: id,
        userId:      adminUser.id,
        altWert:     geloeschtesProdukt as unknown as object ?? undefined,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (deleteProdukt):', e)
    }
    return {}
  } catch {
    return { error: 'Produkt konnte nicht gelöscht werden.' }
  }
}
