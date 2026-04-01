// src/app/actions/admin.ts
'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function createProdukt(): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.produkt.create({
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
    await requireAdmin()
    if (name.trim().length < 1) return { error: 'Name darf nicht leer sein.' }
    await prisma.produkt.update({ where: { id }, data: { name: name.trim() } })
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
    await requireAdmin()
    await prisma.produkt.update({ where: { id }, data: { aktiv } })
    return {}
  } catch {
    return { error: 'Status konnte nicht geändert werden.' }
  }
}

export async function deleteProdukt(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.produkt.delete({ where: { id } })
    return {}
  } catch {
    return { error: 'Produkt konnte nicht gelöscht werden.' }
  }
}
