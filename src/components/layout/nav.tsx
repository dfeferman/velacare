import Link from 'next/link'
import { VelacareLogo } from '@/components/brand/velacare-logo'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

/** Navigation gemäß wireframes/v3/design.md — Höhe 52px, Glassmorphismus, v3-Tokens */
export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rolle = user?.app_metadata?.rolle as string | undefined

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-v3-outline/30 bg-v3-surface/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <VelacareLogo className="h-6 w-6" />
          <span className="font-newsreader text-xl font-bold tracking-tight text-v3-on-surface">Velacare</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-v3-on-surface-v md:flex">
          <Link href="/wie-es-funktioniert" className="transition-colors hover:text-v3-primary">
            Wie es funktioniert
          </Link>
          <Link href="/produkte" className="transition-colors hover:text-v3-primary">
            Produkte
          </Link>
          <Link href="/ueber-uns" className="transition-colors hover:text-v3-primary">
            Über uns
          </Link>
          <Link href="/faq" className="transition-colors hover:text-v3-primary">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={rolle === 'admin' || rolle === 'superadmin' ? '/admin' : '/konto'}
                className="text-sm font-medium text-v3-on-surface-v transition-colors hover:text-v3-primary"
              >
                Mein Konto
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-v3-outline px-4 py-2 text-xs font-medium text-v3-on-surface-v transition-colors hover:border-v3-primary hover:text-v3-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/beantragen"
              className="ripple-btn rounded-lg bg-v3-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-v3-primary/20 transition-all hover:bg-v3-primary-mid active:scale-95"
            >
              Jetzt beantragen
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
