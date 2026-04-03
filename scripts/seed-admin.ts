import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const seedEmail = process.env.ADMIN_SEED_EMAIL?.trim()
const seedPassword = process.env.ADMIN_SEED_PASSWORD?.trim()

if (!supabaseUrl || !serviceRoleKey || !seedEmail || !seedPassword) {
  console.error(
    'Missing env vars. Check .env.local for NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function isDuplicateUserError(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes('already') && m.includes('registered')
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  let page = 1
  const perPage = 200
  const target = email.toLowerCase()
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('listUsers failed:', error.message)
      return null
    }
    const match = data.users.find(u => u.email?.toLowerCase() === target)
    if (match) return match.id
    if (data.users.length < perPage) break
    page += 1
  }
  return null
}

async function seed() {
  console.log(`Seeding superadmin: ${seedEmail}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email: seedEmail,
    password: seedPassword,
    email_confirm: true,
    app_metadata: { rolle: 'superadmin' },
  })

  if (!error) {
    console.log(`✓ Superadmin created: ${data.user?.email} (${data.user?.id})`)
    console.log('  The database trigger created the profiles row automatically.')
    return
  }

  if (!isDuplicateUserError(error.message)) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  const userId = await findUserIdByEmail(seedEmail)
  if (!userId) {
    console.error(
      'User is registered but was not found via listUsers. Set password in Supabase Dashboard → Authentication → Users.'
    )
    process.exit(1)
  }

  const { data: existing, error: getErr } = await supabase.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    console.error('getUserById failed:', getErr?.message ?? 'no user')
    process.exit(1)
  }

  const app_metadata = {
    ...existing.user.app_metadata,
    rolle: 'superadmin' as const,
  }

  const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
    password: seedPassword,
    email_confirm: true,
    app_metadata,
  })

  if (updErr) {
    console.error('updateUserById failed:', updErr.message)
    process.exit(1)
  }

  console.log(`✓ Superadmin exists — password and app_metadata.rolle updated: ${seedEmail}`)
  console.log('  Log in at /login with ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from .env.local')
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
