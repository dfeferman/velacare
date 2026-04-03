export type Pflegegrad = 1 | 2 | 3 | 4 | 5

export type ProduktKategorie =
  | 'Handschuhe'
  | 'Desinfektion'
  | 'Mundschutz'
  | 'Schutzkleidung'
  | 'Hygiene'
  | 'Sonstiges'

export interface Produkt {
  id: string
  name: string
  beschreibung: string
  preis: number            // intern — nie im Kunden-Frontend anzeigen
  maxBudgetProzent: number // abgeleitet: Math.round(preis / 42 * 100), Wertebereich 0–100
  kategorie: ProduktKategorie
  aktiv: boolean
  bildUrl: string
  mengenOptionen?: string[]
}

export interface BoxProdukt {
  produkt: Produkt
  menge: string | null   // Größe (z.B. "M") bei Handschuhen, null sonst
  anzahl: number         // Bestellmenge, immer ≥ 1
}

export interface MockKunde {
  id: string
  vorname: string
  nachname: string
  email: string
  pflegegrad: Pflegegrad
  adresse: string
  krankenkasse: string
  lieferstichtag: number
  status: 'neu' | 'aktiv' | 'pausiert' | 'abgelehnt'
  box: BoxProdukt[]
}

export interface MockLieferung {
  id: string
  kundeId: string
  datum: string
  status: 'geplant' | 'versendet' | 'geliefert' | 'pausiert'
  boxSnapshot: BoxProdukt[]
  gesamtwert: number
}

export interface MockAnfrage {
  id: string
  kundeId: string
  kategorie: 'Box-Inhalt' | 'Lieferung' | 'Adresse' | 'Sonstiges'
  nachricht: string
  status: 'offen' | 'beantwortet'
  antwort?: string
  erstelltAm: string
}
