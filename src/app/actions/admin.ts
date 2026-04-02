// src/app/actions/admin.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAuditLog } from '@/lib/dal/audit'

// ─── Shared Types ─────────────────────────────────────────────────────────────

type ProduktKategorieEnum =
  | 'handschuhe'
  | 'desinfektion'
  | 'mundschutz'
  | 'schutzkleidung'
  | 'hygiene'
  | 'sonstiges'

export interface ProduktFormData {
  name:                  string
  kategorie:             ProduktKategorieEnum
  preis:                 number
  beschreibung:          string
  hersteller:            string
  pflichtkennzeichnung?: string
  aktiv:                 boolean
  sortierung:            number
  mengenOptionen?:       string[]  // nur für Handschuhe
}

// ─── Produkt Actions ──────────────────────────────────────────────────────────

export async function createProdukt(data: ProduktFormData): Promise<{ error?: string }> {
  try {
    const adminUser = await requireAdmin()
    const neuesProdukt = await prisma.produkt.create({
      data: {
        name:                 data.name.trim(),
        kategorie:            data.kategorie,
        preis:                data.preis,
        beschreibung:         data.beschreibung.trim(),
        hersteller:           data.hersteller.trim(),
        pflichtkennzeichnung: data.pflichtkennzeichnung?.trim() ?? null,
        bild_url:             '',
        aktiv:                data.aktiv,
        sortierung:           data.sortierung,
        varianten:            data.mengenOptionen?.length
                                ? { mengenOptionen: data.mengenOptionen }
                                : undefined,
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
    revalidatePath('/admin/produkte')
    return {}
  } catch {
    return { error: 'Produkt konnte nicht erstellt werden.' }
  }
}

export async function updateProdukt(
  id: string,
  data: ProduktFormData,
): Promise<{ error?: string }> {
  try {
    const adminUser   = await requireAdmin()
    const altesProdukt = await prisma.produkt.findUnique({ where: { id } })
    const aktualisiert = await prisma.produkt.update({
      where: { id },
      data: {
        name:                 data.name.trim(),
        kategorie:            data.kategorie,
        preis:                data.preis,
        beschreibung:         data.beschreibung.trim(),
        hersteller:           data.hersteller.trim(),
        pflichtkennzeichnung: data.pflichtkennzeichnung?.trim() ?? null,
        aktiv:                data.aktiv,
        sortierung:           data.sortierung,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        varianten:            (data.mengenOptionen?.length
                                ? { mengenOptionen: data.mengenOptionen }
                                : null) as any,
      },
    })
    try {
      await writeAuditLog({
        aktion:      'produkt_aktualisiert',
        entitaet:    'Produkt',
        entitaet_id: id,
        userId:      adminUser.id,
        altWert:     altesProdukt as unknown as object ?? undefined,
        neuWert:     aktualisiert as unknown as object,
      })
    } catch (e) {
      console.error('AuditLog-Write fehlgeschlagen (updateProdukt):', e)
    }
    revalidatePath('/admin/produkte')
    return {}
  } catch {
    return { error: 'Produkt konnte nicht aktualisiert werden.' }
  }
}

export async function toggleProduktAktiv(
  id: string,
  aktiv: boolean,
): Promise<{ error?: string }> {
  try {
    const adminUser    = await requireAdmin()
    const vorherProdukt = await prisma.produkt.findUnique({ where: { id } })
    const aktualisiert  = await prisma.produkt.update({ where: { id }, data: { aktiv } })
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
    revalidatePath('/admin/produkte')
    return {}
  } catch {
    return { error: 'Status konnte nicht geändert werden.' }
  }
}

export async function deleteProdukt(id: string): Promise<{ error?: string }> {
  try {
    const adminUser       = await requireAdmin()
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
    revalidatePath('/admin/produkte')
    return {}
  } catch {
    return { error: 'Produkt konnte nicht gelöscht werden.' }
  }
}
