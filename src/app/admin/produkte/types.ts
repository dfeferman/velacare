export interface ProduktAdminRow {
  id:                   string
  name:                 string
  kategorie:            string
  preis:                number
  beschreibung:         string
  hersteller:           string
  pflichtkennzeichnung: string | null
  aktiv:                boolean
  sortierung:           number
  varianten:            { mengenOptionen?: string[] } | null
}
