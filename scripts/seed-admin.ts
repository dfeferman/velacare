import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const seedEmail = process.env.ADMIN_SEED_EMAIL
const seedPassword = process.env.ADMIN_SEED_PASSWORD

if (!supabaseUrl || !serviceRoleKey || !seedEmail || !seedPassword) {
  console.error(
    'Missing env vars. Check .env.local for NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log(`Creating superadmin: ${seedEmail}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email: seedEmail!,
    password: seedPassword!,
    email_confirm: true,
    app_metadata: { rolle: 'superadmin' },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('ℹ User already exists — skipping.')
      process.exit(0)
    }
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✓ Superadmin created: ${data.user?.email} (${data.user?.id})`)
  console.log('  The database trigger created the profiles row automatically.')
}

seed()
