import { createClient } from '@supabase/supabase-js'

/**
 * Service Role client — server-only. Never import in Client Components.
 * SUPABASE_SERVICE_ROLE_KEY must be a server-only env var (no NEXT_PUBLIC_ prefix).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
