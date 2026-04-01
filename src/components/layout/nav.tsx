import Link from 'next/link'
import { VelacareLogo } from '@/components/brand/velacare-logo'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

/** Navigation gemäß wireframes/01-startseite-hero-zuerst — Höhe 52px wie velacare-brandbook.html */
export async function Nav() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rolle = user?.app_metadata?.rolle as string | undefined

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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={rolle === 'admin' || rolle === 'superadmin' ? '/admin' : '/konto'}
                className="text-sm font-medium text-warm-gray transition-colors hover:text-terra"
              >
                Mein Konto
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-mid-gray px-4 py-2 text-xs font-medium text-warm-gray transition-colors hover:border-terra hover:text-terra"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/beantragen"
              className="rounded-lg bg-terra px-4 py-2 text-xs font-bold text-white shadow-sm shadow-terra/20 transition-all hover:bg-terra-dark active:scale-95"
            >
              Jetzt beantragen
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
