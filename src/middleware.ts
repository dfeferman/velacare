import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseUrlAndAnonKey } from '@/lib/supabase/public-env'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const [supabaseUrl, supabaseAnonKey] = getSupabaseUrlAndAnonKey()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always call getUser() to refresh the session cookie.
  // Never use getSession() in middleware — it does not validate the token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const rolle = user?.app_metadata?.rolle as string | undefined

  // /konto/* requires an authenticated kunde
  if (path.startsWith('/konto')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (rolle !== 'kunde') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // /admin/* requires admin or superadmin
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (rolle !== 'admin' && rolle !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // /login redirects already-authenticated users to their area
  if (path === '/login' && user) {
    if (rolle === 'kunde') {
      return NextResponse.redirect(new URL('/konto', request.url))
    }
    if (rolle === 'admin' || rolle === 'superadmin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
