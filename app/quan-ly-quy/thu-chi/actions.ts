'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { transactionSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { Member, TransactionWithMember } from '@/lib/types/database'

export async function getTransactions(): Promise<TransactionWithMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, members(name)')
    .order('date', { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)

  return (data || []).map((t: any) => ({
    ...t,
    member_name: t.members?.name || null,
    members: undefined,
  }))
}

export async function getMembersForDropdown(): Promise<Pick<Member, 'id' | 'name'>[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('members')
    .select('id, name')
    .neq('status', 'deleted')
    .order('name')
  return data || []
}

export async function createTransaction(formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = transactionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('transactions').insert({
    date: parsed.data.date || new Date().toISOString(),
    type: parsed.data.type,
    amount: parsed.data.amount,
    category: parsed.data.category,
    description: parsed.data.description,
    member_id: parsed.data.member_id || null,
    note: parsed.data.note || null,
  })

  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}

export async function updateTransaction(id: string, formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = transactionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('transactions').update({
    date: parsed.data.date || null,
    type: parsed.data.type,
    amount: parsed.data.amount,
    category: parsed.data.category,
    description: parsed.data.description,
    member_id: parsed.data.member_id || null,
    note: parsed.data.note || null,
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}
