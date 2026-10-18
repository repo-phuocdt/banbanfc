import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client for machine callers (bank webhook, cron). Bypasses RLS:
// import only from route handlers, never from client components or server actions.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service configuration')
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
