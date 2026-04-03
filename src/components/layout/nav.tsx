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
    <nav className="fixed top-0 z-50 w-full border-b border-v3-outline/20 bg-v3-surface/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center px-6">
        {/* Logo — etwas größer als v1, Newsreader bleibt */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <VelacareLogo className="h-8 w-8" />
          <span className="font-newsreader text-[22px] font-bold leading-none tracking-tight text-v3-on-surface">
            Velacare
          </span>
        </Link>

        {/* Primärnavigation — direkt links neben dem Logo */}
        <div className="ml-10 hidden items-center gap-1 md:flex">
          {[
            { href: '/wie-es-funktioniert', label: 'Wie es funktioniert' },
            { href: '/produkte', label: 'Produkte' },
            { href: '/ueber-uns', label: 'Über uns' },
            { href: '/faq', label: 'FAQ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-v3-on-surface-v transition-colors hover:bg-v3-primary-pale hover:text-v3-primary"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA — ganz rechts */}
        <div className="ml-auto flex items-center gap-3">
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
