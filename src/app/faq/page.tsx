const FAQS = [
  { frage: 'Was sind Pflegehilfsmittel?', antwort: 'Pflegehilfsmittel sind Produkte, die bei der häuslichen Pflege eingesetzt werden — zum Beispiel Einmalhandschuhe, Desinfektion oder Betteinlagen. Nach § 40 SGB XI haben Pflegebedürftige Anspruch auf bis zu 42 € monatlich.' },
  { frage: 'Wer hat Anspruch?', antwort: 'Alle Personen mit einem anerkannten Pflegegrad 1–5, die zuhause gepflegt werden und gesetzlich krankenversichert sind.' },
  { frage: 'Kostet das Velacare etwas?', antwort: 'Nein. Die Pflegekasse übernimmt die Kosten bis 42 € monatlich vollständig. Für Sie entstehen keine Zuzahlungen.' },
  { frage: 'Wie lange dauert es bis zur ersten Lieferung?', antwort: 'Nach Bearbeitung Ihres Antrags durch die Pflegekasse (ca. 2–4 Wochen) erhalten Sie Ihre erste Box zum gewählten Lieferstichtag.' },
  { frage: 'Kann ich die Box jederzeit ändern?', antwort: 'Ja. Änderungen sind jederzeit im Kundenkonto möglich und gelten ab der nächsten Lieferung.' },
]

export default function FaqPage() {
  return (
    <div className="py-20 px-6 max-w-2xl mx-auto">
      <h1 className="font-serif text-5xl font-semibold text-center mb-16">Häufige Fragen</h1>
      <div className="space-y-6">
        {FAQS.map(faq => (
          <div key={faq.frage} className="border-b border-mid-gray pb-6">
            <h3 className="font-serif text-xl font-semibold mb-2">{faq.frage}</h3>
            <p className="text-warm-gray leading-relaxed">{faq.antwort}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
