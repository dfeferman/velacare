import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrlAndAnonKey } from '@/lib/supabase/public-env'

/**
 * Service Role client — server-only. Never import in Client Components.
 * SUPABASE_SERVICE_ROLE_KEY: klassischer `service_role`-JWT oder Secret Key `sb_secret_...`.
 */
export function createAdminClient() {
  const [url] = getSupabaseUrlAndAnonKey()
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
