import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types/action-result'
import type { User } from '@supabase/supabase-js'

type AdminResult =
  | { user: User; error?: never }
  | { user?: never; error: ActionResult }

export async function requireAdmin(): Promise<AdminResult> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: { success: false, error: 'Bạn chưa đăng nhập' } }
  }

  // Check admin role in app_metadata (defense-in-depth with RLS)
  const isAdmin = user.app_metadata?.is_admin === true
  if (!isAdmin) {
    return { error: { success: false, error: 'Bạn không có quyền thực hiện thao tác này' } }
  }

  return { user }
}
