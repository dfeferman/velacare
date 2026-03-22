import Link from 'next/link'
import { VelacareLogo } from '@/components/brand/velacare-logo'

/** Navigation gemäß wireframes/01-startseite-hero-zuerst — Höhe 52px wie velacare-brandbook.html */
export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-mid-gray/30 bg-warm-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <VelacareLogo className="h-6 w-6" />
          <span className="font-serif text-xl font-bold tracking-tight text-dark">Velacare</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-warm-gray md:flex">
          <Link href="/wie-es-funktioniert" className="transition-colors hover:text-terra">
            Wie es funktioniert
          </Link>
          <Link href="/produkte" className="transition-colors hover:text-terra">
            Produkte
          </Link>
          <Link href="/ueber-uns" className="transition-colors hover:text-terra">
            Über uns
          </Link>
          <Link href="/faq" className="transition-colors hover:text-terra">
            FAQ
          </Link>
        </div>
        <Link
          href="/beantragen"
          className="rounded-lg bg-terra px-4 py-2 text-xs font-bold text-white shadow-sm shadow-terra/20 transition-all hover:bg-terra-dark active:scale-95"
        >
          Jetzt beantragen
        </Link>
      </div>
    </nav>
  )
}
