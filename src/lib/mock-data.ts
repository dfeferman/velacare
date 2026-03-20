import type { Produkt, MockKunde, MockLieferung, MockAnfrage } from './types'

export const MOCK_PRODUKTE: Produkt[] = [
  {
    id: 'p1',
    name: 'Einmalhandschuhe latexfrei',
    beschreibung: '100 Stück, puderfrei, für empfindliche Haut geeignet',
    preis: 8.50,
    kategorie: 'Handschuhe',
    aktiv: true,
    bildUrl: '/mock/handschuhe.jpg',
    mengenOptionen: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'p2',
    name: 'Händedesinfektionsmittel',
    beschreibung: '500ml, VAH-gelistet, mit Pflegewirkstoffen',
    preis: 7.90,
    kategorie: 'Desinfektion',
    aktiv: true,
    bildUrl: '/mock/desinfektion.jpg',
  },
  {
    id: 'p3',
    name: 'FFP2-Masken',
    beschreibung: '10 Stück, CE-zertifiziert, bequeme Passform',
    preis: 9.50,
    kategorie: 'Mundschutz',
    aktiv: true,
    bildUrl: '/mock/masken.jpg',
  },
  {
    id: 'p4',
    name: 'Einmalschürzen',
    beschreibung: '100 Stück, reißfest, HDPE',
    preis: 6.80,
    kategorie: 'Schutzkleidung',
    aktiv: true,
    bildUrl: '/mock/schuerzen.jpg',
  },
  {
    id: 'p5',
    name: 'Pflegebetteinlagen',
    beschreibung: '30 Stück, saugstark, mit Klebestreifen',
    preis: 12.40,
    kategorie: 'Hygiene',
    aktiv: true,
    bildUrl: '/mock/betteinlagen.jpg',
  },
  {
    id: 'p6',
    name: 'Flächendesinfektion Spray',
    beschreibung: '750ml, schnell wirkend, für alle Oberflächen',
    preis: 8.90,
    kategorie: 'Desinfektion',
    aktiv: true,
    bildUrl: '/mock/flaechen.jpg',
  },
]

export const MOCK_KUNDEN: MockKunde[] = [
  {
    id: 'k1',
    vorname: 'Maria',
    nachname: 'Hoffmann',
    email: 'maria.hoffmann@example.de',
    pflegegrad: 2,
    adresse: 'Musterstraße 12, 80331 München',
    krankenkasse: 'AOK Bayern',
    lieferstichtag: 15,
    status: 'aktiv',
    box: [
      { produkt: MOCK_PRODUKTE[0], menge: 'M' },
      { produkt: MOCK_PRODUKTE[1], menge: null },
      { produkt: MOCK_PRODUKTE[4], menge: null },
    ],
  },
  {
    id: 'k2',
    vorname: 'Hans',
    nachname: 'Müller',
    email: 'hans.mueller@example.de',
    pflegegrad: 3,
    adresse: 'Berliner Allee 5, 40212 Düsseldorf',
    krankenkasse: 'Techniker Krankenkasse',
    lieferstichtag: 1,
    status: 'aktiv',
    box: [
      { produkt: MOCK_PRODUKTE[0], menge: 'L' },
      { produkt: MOCK_PRODUKTE[2], menge: null },
    ],
  },
  {
    id: 'k3',
    vorname: 'Ingrid',
    nachname: 'Weber',
    email: 'ingrid.weber@example.de',
    pflegegrad: 1,
    adresse: 'Gartenweg 3, 22111 Hamburg',
    krankenkasse: 'BARMER',
    lieferstichtag: 20,
    status: 'pausiert',
    box: [],
  },
]

export const MOCK_LIEFERUNGEN: MockLieferung[] = [
  {
    id: 'l1',
    kundeId: 'k1',
    datum: '2026-03-15',
    status: 'geliefert',
    boxSnapshot: MOCK_KUNDEN[0].box,
    gesamtwert: 28.80,
  },
  {
    id: 'l2',
    kundeId: 'k1',
    datum: '2026-04-15',
    status: 'geplant',
    boxSnapshot: MOCK_KUNDEN[0].box,
    gesamtwert: 28.80,
  },
  {
    id: 'l3',
    kundeId: 'k2',
    datum: '2026-04-01',
    status: 'geplant',
    boxSnapshot: MOCK_KUNDEN[1].box,
    gesamtwert: 18.00,
  },
]

export const MOCK_ANFRAGEN: MockAnfrage[] = [
  {
    id: 'a1',
    kundeId: 'k1',
    kategorie: 'Box-Inhalt',
    nachricht: 'Ich würde gerne die Handschuhgröße von M auf L ändern.',
    status: 'beantwortet',
    antwort: 'Gerne! Wir haben die Änderung für Ihre nächste Lieferung vorgemerkt.',
    erstelltAm: '2026-03-10',
  },
  {
    id: 'a2',
    kundeId: 'k2',
    kategorie: 'Lieferung',
    nachricht: 'Wann kommt meine nächste Lieferung?',
    status: 'offen',
    erstelltAm: '2026-03-18',
  },
]

export const MOCK_BUDGET_LIMIT = 42.00
