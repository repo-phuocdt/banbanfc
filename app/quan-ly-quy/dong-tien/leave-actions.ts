'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { leaveSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'

export async function markLeave(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = leaveSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: paid } = await supabase.from('contributions').select('id')
    .eq('member_id', parsed.data.member_id).eq('month', parsed.data.month).maybeSingle()
  if (paid) return { success: false, error: 'Tháng này đã đóng tiền. Hãy hủy khoản đóng trước khi đánh dấu nghỉ' }

  const { error } = await supabase.from('member_leaves').insert({
    member_id: parsed.data.member_id,
    month: parsed.data.month,
    note: parsed.data.note || null,
  })
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Tháng này đã được đánh dấu nghỉ' }
    return { success: false, error: error.message }
  }

  revalidatePath('/quan-ly-quy/dong-tien')
  return { success: true }
}

export async function unmarkLeave(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = leaveSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('member_leaves').delete()
    .eq('member_id', parsed.data.member_id).eq('month', parsed.data.month)
  if (error) return { success: false, error: error.message }

  revalidatePath('/quan-ly-quy/dong-tien')
  return { success: true }
}
