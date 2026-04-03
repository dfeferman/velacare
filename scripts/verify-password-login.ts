/**
 * Prüft, ob signInWithPassword mit denselben Public-Env-Variablen wie die App funktioniert.
 * Läuft nur lokal: npx tsx --env-file=.env.local scripts/verify-password-login.ts
 */
import { createClient } from '@supabase/supabase-js'

function pickKey(): { key: string; quelle: string } {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
  const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''
  const anonIstPlatzhalter =
    !anon ||
    anon === 'your-anon-key' ||
    /^YOUR_/i.test(anon)
  if (pub.startsWith('sb_publishable')) {
    return { key: pub, quelle: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' }
  }
  if (!anonIstPlatzhalter) {
    return { key: anon, quelle: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }
  }
  return { key: pub || anon, quelle: pub ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const { key, quelle } = pickKey()
const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_SEED_PASSWORD?.trim()

if (!url || !key || !email || !password) {
  console.error(
    'Fehlende Werte: NEXT_PUBLIC_SUPABASE_URL, Public-Key (Anon oder Publishable), ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD'
  )
  process.exit(1)
}

console.log('URL:', url)
console.log('Public-Key-Quelle (wie in der App):', quelle)
console.log('Key-Präfix:', key.slice(0, 14) + '…')
console.log('E-Mail (Seed):', email)
console.log('Teste signInWithPassword…\n')

async function main() {
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Fehler:', error.message)
    console.error('\nHäufige Ursachen:')
    console.error('- Falscher Public-Key oder falsches Projekt (URL + Keys müssen zusammenpassen)')
    console.error('- ANON_KEY noch Platzhalter, obwohl nur Publishable echt ist (App bevorzugt jetzt Publishable)')
    console.error('- Supabase → Auth → Providers: „Email“ mit Passwort aktivieren')
    console.error('- npm run seed:admin erneut ausführen, um Passwort zu setzen')
    process.exit(1)
  }

  console.log('OK — Anmeldung klappt mit diesen Umgebungsvariablen.')
  console.log('User-ID:', data.user?.id)
  console.log('app_metadata.rolle:', data.user?.app_metadata?.rolle ?? '(fehlt)')
  if (!data.user?.app_metadata?.rolle) {
    console.warn('\nHinweis: rolle fehlt im JWT — npm run seed:admin ausführen oder Rolle im Dashboard setzen.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
