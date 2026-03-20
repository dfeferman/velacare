import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-white/95 backdrop-blur-sm border-b border-mid-gray h-14 flex items-center px-6 gap-8">
      <Link href="/" className="font-serif text-xl font-semibold text-dark flex-shrink-0">
        Velacare
        <span className="font-sans text-xs font-normal tracking-widest uppercase text-terra ml-2">
          Pflegehilfsmittel
        </span>
      </Link>
      <div className="flex gap-1 flex-1 overflow-x-auto">
        <Link href="/wie-es-funktioniert" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Wie es funktioniert</Link>
        <Link href="/produkte" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Produkte</Link>
        <Link href="/faq" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">FAQ</Link>
        <Link href="/ueber-uns" className="text-xs text-warm-gray hover:text-terra px-3 py-1 whitespace-nowrap transition-colors">Über uns</Link>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/login" className="text-xs text-warm-gray hover:text-dark transition-colors">Anmelden</Link>
        <Button variant="primary" className="text-xs px-4 py-2">
          <Link href="/beantragen">Jetzt beantragen</Link>
        </Button>
      </div>
    </nav>
  )
}
