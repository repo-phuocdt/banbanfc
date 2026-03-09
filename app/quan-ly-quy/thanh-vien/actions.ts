'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { memberSchema, memberStatusSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { MemberWithTotal } from '@/lib/types/database'

export async function getMembers(): Promise<MemberWithTotal[]> {
  const supabase = createClient()
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .neq('status', 'deleted')
    .order('name')

  if (error) throw new Error(error.message)

  // Get contribution totals
  const { data: totals } = await supabase
    .from('contributions')
    .select('member_id, amount')

  const totalMap = new Map<string, number>()
  totals?.forEach(c => {
    totalMap.set(c.member_id, (totalMap.get(c.member_id) || 0) + c.amount)
  })

  return (members || []).map(m => ({
    ...m,
    total_contributed: totalMap.get(m.id) || 0,
  }))
}

export async function createMember(formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = memberSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('members').insert({
    name: parsed.data.name,
    status: parsed.data.status,
    note: parsed.data.note || null,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Tên thành viên đã tồn tại' }
    return { success: false, error: error.message }
  }

  revalidatePath('/quan-ly-quy/thanh-vien')
  return { success: true }
}

export async function updateMember(id: string, formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = memberSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('members').update({
    name: parsed.data.name,
    status: parsed.data.status,
    note: parsed.data.note || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thanh-vien')
  return { success: true }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = createClient()

  // Soft delete
  const { error } = await supabase.from('members').update({
    status: 'deleted',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thanh-vien')
  return { success: true }
}

export async function updateMemberStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin()

  // Validate status against allowed enum values (prevent bypass to 'deleted')
  const parsed = memberStatusSchema.safeParse(status)
  if (!parsed.success) return { success: false, error: 'Trạng thái không hợp lệ' }

  const supabase = createClient()
  const { error } = await supabase.from('members').update({
    status: parsed.data,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thanh-vien')
  return { success: true }
}
