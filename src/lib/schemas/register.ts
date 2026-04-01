import { z } from 'zod'

export const registerSchema = z.object({
  // Pflegebedürftiger
  vorname:              z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname:             z.string().min(2, 'Mindestens 2 Zeichen'),
  geburtsdatum:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  pflegegrad:           z.number().int().min(1).max(5),
  telefon:              z.string().min(6, 'Pflichtfeld'),
  // Krankenkasse
  krankenkasse:         z.string().min(2, 'Pflichtfeld'),
  versicherungsnummer:  z.string().min(6, 'Mindestens 6 Zeichen'),
  // Adresse
  strasse:              z.string().min(2, 'Pflichtfeld'),
  hausnummer:           z.string().min(1, 'Pflichtfeld'),
  adresszusatz:         z.string().optional(),
  plz:                  z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
  ort:                  z.string().min(2, 'Pflichtfeld'),
  // Lieferadresse
  lieferadresse_abweichend: z.boolean(),
  lieferadresse: z.object({
    strasse:    z.string().min(2, 'Pflichtfeld'),
    hausnummer: z.string().min(1, 'Pflichtfeld'),
    plz:        z.string().regex(/^\d{5}$/, '5-stellige PLZ'),
    ort:        z.string().min(2, 'Pflichtfeld'),
  }).optional(),
  // Versorgung
  versorgungssituation: z.enum(['erstversorgung', 'wechsel']),
  beratung:             z.boolean(),
  // Account
  email:                z.string().email('Gültige E-Mail-Adresse erforderlich'),
  passwort:             z.string().min(8, 'Mindestens 8 Zeichen'),
})

export type Step2Data = z.infer<typeof registerSchema>
