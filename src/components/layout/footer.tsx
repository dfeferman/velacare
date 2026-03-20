import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-dark text-warm-white/60 py-12 px-6 mt-20">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-serif text-lg font-semibold text-warm-white mb-1">Velacare</div>
          <div className="text-xs tracking-widest uppercase text-terra-light mb-4">Pflegehilfsmittel</div>
          <p className="text-xs leading-relaxed">Pflege, die jeden Monat ankommt.</p>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Service</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/wie-es-funktioniert" className="hover:text-terra-light transition-colors">Wie es funktioniert</Link></li>
            <li><Link href="/produkte" className="hover:text-terra-light transition-colors">Produkte</Link></li>
            <li><Link href="/beantragen" className="hover:text-terra-light transition-colors">Jetzt beantragen</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Über uns</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/ueber-uns" className="hover:text-terra-light transition-colors">Über Velacare</Link></li>
            <li><Link href="/faq" className="hover:text-terra-light transition-colors">FAQ</Link></li>
            <li><Link href="/kontakt" className="hover:text-terra-light transition-colors">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest uppercase text-warm-white/40 mb-3">Rechtliches</div>
          <ul className="space-y-2 text-xs">
            <li><span className="opacity-50">Datenschutz</span></li>
            <li><span className="opacity-50">AGB</span></li>
            <li><span className="opacity-50">Impressum</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto border-t border-warm-white/10 mt-10 pt-6 text-xs text-center opacity-40">
        © 2026 Velacare · Alle Rechte vorbehalten
      </div>
    </footer>
  )
}
