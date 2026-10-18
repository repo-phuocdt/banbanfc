'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { contributionSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { Contribution, Member, MemberLeave } from '@/lib/types/database'

export async function getContributions(): Promise<Contribution[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .order('month')
  if (error) throw new Error(error.message)
  return data || []
}

export async function getLeaves(): Promise<MemberLeave[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('member_leaves').select('*').order('month')
  if (error) throw new Error(error.message)
  return data || []
}

export async function getActiveMembers(): Promise<Member[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .neq('status', 'deleted')
    .order('name')
  if (error) throw new Error(error.message)
  return data || []
}

export async function createContribution(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = contributionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  // Validate month not too far in future (max 12 months ahead)
  const now = new Date()
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 12, 1)
  const maxMonth = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}`
  if (parsed.data.month > maxMonth) {
    return { success: false, error: 'Tháng không hợp lệ (tối đa 12 tháng trong tương lai)' }
  }

  const supabase = createClient()

  const { data: leave } = await supabase.from('member_leaves').select('id')
    .eq('member_id', parsed.data.member_id).eq('month', parsed.data.month).maybeSingle()
  if (leave) return { success: false, error: 'Tháng này đang đánh dấu nghỉ, hãy bỏ nghỉ trước' }

  // Insert contribution
  const { data: contrib, error } = await supabase.from('contributions').insert({
    member_id: parsed.data.member_id,
    month: parsed.data.month,
    amount: parsed.data.amount,
    paid_at: parsed.data.paid_at || new Date().toISOString(),
    note: parsed.data.note || null,
  }).select().single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Thành viên đã đóng tháng này rồi' }
    return { success: false, error: error.message }
  }

  // Auto-create linked transaction
  await supabase.from('transactions').insert({
    date: parsed.data.paid_at || new Date().toISOString(),
    type: 'income',
    amount: parsed.data.amount,
    category: 'Quỹ hàng tháng',
    description: `Đóng quỹ tháng ${parsed.data.month}`,
    member_id: parsed.data.member_id,
    contribution_id: contrib.id,
  })

  revalidatePath('/quan-ly-quy/dong-tien')
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}

export async function updateContribution(id: string, formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = contributionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { data: linked, error: linkedError } = await supabase
    .from('transactions').select('id, bank_transaction_id').eq('contribution_id', id)
  if (linkedError) return { success: false, error: linkedError.message }
  if (linked.some(t => t.bank_transaction_id)) {
    return { success: false, error: 'Khoản đóng từ chuyển khoản ngân hàng: dùng "Hủy ghi nhận" trong mục Giao dịch ngân hàng' }
  }
  if (linked.length > 1) {
    return { success: false, error: 'Khoản đóng gồm nhiều giao dịch, vui lòng sửa trong Thu chi' }
  }

  const { error } = await supabase.from('contributions').update({
    amount: parsed.data.amount,
    note: parsed.data.note || null,
  }).eq('id', id)

  if (error) return { success: false, error: error.message }

  // Update linked transaction
  await supabase.from('transactions').update({
    amount: parsed.data.amount,
  }).eq('contribution_id', id)

  revalidatePath('/quan-ly-quy/dong-tien')
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}

export async function deleteContribution(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const supabase = createClient()

  const { data: bankLinked, error: linkError } = await supabase.from('transactions').select('id')
    .eq('contribution_id', id).not('bank_transaction_id', 'is', null).limit(1)
  if (linkError) return { success: false, error: linkError.message }
  if (bankLinked.length) {
    return { success: false, error: 'Khoản đóng từ chuyển khoản ngân hàng: dùng "Hủy ghi nhận" trong mục Giao dịch ngân hàng' }
  }

  // Delete linked transaction first
  await supabase.from('transactions').delete().eq('contribution_id', id)

  const { error } = await supabase.from('contributions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/quan-ly-quy/dong-tien')
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}
