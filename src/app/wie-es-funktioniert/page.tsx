import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SCHRITTE = [
  { num: '01', title: 'Anspruch prüfen', desc: 'Pflegegrad 1–5 und häusliche Pflege reichen aus. Gesetzlich versichert? Dann haben Sie Anspruch auf bis zu 42 € monatlich — kostenlos.' },
  { num: '02', title: 'Box zusammenstellen', desc: 'Wählen Sie aus Handschuhen, Desinfektion, Mundschutz, Pflegebetteinlagen und mehr. Ihr Budget wird live angezeigt.' },
  { num: '03', title: 'Antrag wird gestellt', desc: 'Wir stellen den Antrag bei Ihrer Pflegekasse. Kein Papierkram für Sie — wir erledigen alles.' },
  { num: '04', title: 'Monatliche Lieferung', desc: 'Ihre Box kommt pünktlich jeden Monat zum gewünschten Datum. Sie können jederzeit die Zusammenstellung ändern.' },
]

export default function WieEsFunktioniertPage() {
  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <p className="text-xs tracking-widest uppercase text-warm-gray text-center mb-3">Schritt für Schritt</p>
      <h1 className="font-serif text-5xl font-semibold text-center mb-16">Wie es funktioniert</h1>
      <div className="space-y-12">
        {SCHRITTE.map(s => (
          <div key={s.num} className="flex gap-8">
            <div className="font-serif text-5xl font-semibold text-terra/20 flex-shrink-0 w-16">{s.num}</div>
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-3">{s.title}</h2>
              <p className="text-warm-gray leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <Button variant="primary" className="text-base px-8 py-3">
          <Link href="/beantragen">Jetzt beantragen</Link>
        </Button>
      </div>
    </div>
  )
}
