'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { transactionSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { Member, TransactionWithMember } from '@/lib/types/database'
import { groupBankRows } from '@/lib/utils/group-bank-rows'
import { sanitizeContent } from '@/lib/bank/normalize'

export async function getTransactions(): Promise<TransactionWithMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, members(name), bank_transactions(content)')
    // Newest recorded last (the page reverses it); rows imported in one batch share
    // created_at, so their transaction date keeps them in chronological order.
    .order('created_at', { ascending: true })
    .order('date', { ascending: true, nullsFirst: true })

  if (error) throw new Error(error.message)

  // One bank transfer is shown as one row even when it paid for several months.
  return groupBankRows((data || []).map((t: any) => ({
    ...t,
    member_name: t.members?.name || null,
    bank_content: t.bank_transactions?.content ? sanitizeContent(t.bank_transactions.content) : null,
    members: undefined,
    bank_transactions: undefined,
  })))
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
  const admin = await requireAdmin()
  if (admin.error) return admin.error
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

const BANK_LINKED_ERROR = 'Giao dịch từ chuyển khoản ngân hàng: dùng "Hủy ghi nhận" trong trang Đóng tiền'

async function isBankLinked(supabase: ReturnType<typeof createClient>, id: string): Promise<boolean | string> {
  const { data, error } = await supabase.from('transactions').select('bank_transaction_id').eq('id', id).maybeSingle()
  if (error) return error.message
  return !!data?.bank_transaction_id
}

export async function updateTransaction(id: string, formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = transactionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const linked = await isBankLinked(supabase, id)
  if (linked) return { success: false, error: typeof linked === 'string' ? linked : BANK_LINKED_ERROR }

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
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const supabase = createClient()
  const linked = await isBankLinked(supabase, id)
  if (linked) return { success: false, error: typeof linked === 'string' ? linked : BANK_LINKED_ERROR }

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/quan-ly-quy/thu-chi')
  revalidatePath('/quan-ly-quy')
  return { success: true }
}
