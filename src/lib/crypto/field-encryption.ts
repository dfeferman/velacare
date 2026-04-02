import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('FIELD_ENCRYPTION_KEY muss ein 64-stelliger Hex-String sein')
  }
  return Buffer.from(hex, 'hex')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join('.')
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split('.')
  if (parts.length !== 3) throw new Error('Ungültiges Chiffrat-Format')
  const [ivHex, authTagHex, dataHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

interface SensitiveKundenFields {
  vorname: string
  nachname: string
  geburtsdatum: string
  pflegegrad: string
}

export function encryptKundenProfile(fields: SensitiveKundenFields): SensitiveKundenFields {
  return {
    vorname: encrypt(fields.vorname),
    nachname: encrypt(fields.nachname),
    geburtsdatum: encrypt(fields.geburtsdatum),
    pflegegrad: encrypt(fields.pflegegrad),
  }
}

export function decryptKundenProfile(fields: SensitiveKundenFields): SensitiveKundenFields {
  return {
    vorname: decrypt(fields.vorname),
    nachname: decrypt(fields.nachname),
    geburtsdatum: decrypt(fields.geburtsdatum),
    pflegegrad: decrypt(fields.pflegegrad),
  }
}
