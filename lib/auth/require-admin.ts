import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')

  // Check admin role in app_metadata (defense-in-depth with RLS)
  const isAdmin = user.app_metadata?.is_admin === true
  if (!isAdmin) throw new Error('Forbidden: Admin access required')

  return user
}
