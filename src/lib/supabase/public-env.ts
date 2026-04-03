/**
 * Öffentliche Supabase-Credentials für Browser-, Server- und Edge-Clients.
 * Unterstützt klassischen JWT-Anon-Key oder neuen Publishable Key (`sb_publishable_...`).
 *
 * Wichtig: Steht in .env.local noch ein Platzhalter bei ANON_KEY (`your-anon-key`),
 * wird der echte Publishable Key sonst ignoriert — deshalb Publishable bevorzugen,
 * sobald er gesetzt ist.
 */
export function getSupabaseUrlAndAnonKey(): readonly [string, string] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
  const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

  const anonIstPlatzhalter =
    !anon ||
    anon === 'your-anon-key' ||
    /^YOUR_/i.test(anon)

  let key: string
  if (pub.startsWith('sb_publishable')) {
    key = pub
  } else if (!anonIstPlatzhalter) {
    key = anon
  } else {
    key = pub || anon
  }

  return [url, key] as const
}
