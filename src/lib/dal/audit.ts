import { prisma } from '@/lib/prisma'

// Sentinel UUID used when no entity ID is available (e.g. product creation before ID is known)
const NULL_UUID = '00000000-0000-0000-0000-000000000000'

interface AuditEntry {
  aktion: string
  /** Maps to `entitaet` column */
  entitaet: string
  /** Maps to `entitaet_id` column — required UUID in DB; pass NULL_UUID if unavailable */
  entitaet_id?: string
  /** Maps to `user_id` column */
  userId: string
  /** Maps to `alt_wert` column */
  altWert?: object
  /** Maps to `neu_wert` column */
  neuWert?: object
  /** IP address; falls back to '0.0.0.0' if not available */
  ipAdresse?: string
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      aktion:       entry.aktion,
      entitaet:     entry.entitaet,
      entitaet_id:  entry.entitaet_id ?? NULL_UUID,
      user_id:      entry.userId,
      alt_wert:     entry.altWert ?? undefined,
      neu_wert:     entry.neuWert ?? undefined,
      ip_adresse:   entry.ipAdresse ?? '0.0.0.0',
    },
  })
}
