'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { applyIncome } from '@/lib/bank/apply-income'
import { normalizeText, sanitizeContent } from '@/lib/bank/normalize'
import { assignBankSchema, resolveBankSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { BankTransaction } from '@/lib/types/database'

export interface BankTransactionWithMembers extends BankTransaction {
  member_names: string[]
}

const REASON_MESSAGES = {
  invalid_amount: 'Số tiền không hợp lệ',
  over_threshold: 'Số tiền vượt ngưỡng',
  overflow: 'Vượt quá 12 tháng đóng trước, hãy chia bớt cho người khác hoặc ghi "Góp thêm"',
} as const

function revalidateFund() {
  revalidatePath('/quan-ly-quy', 'layout')
}

async function loadPending(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('bank_transactions').select('*').eq('id', id).maybeSingle<BankTransaction>()
  if (error) return { error: error.message }
  if (!data || data.status !== 'pending') return { error: 'Giao dịch đã được xử lý' }
  return { supabase, tx: data }
}

/** Admin-only (RLS): pending queue plus the most recently resolved transactions. */
export async function getBankInbox(): Promise<{ pending: BankTransaction[]; recent: BankTransactionWithMembers[] }> {
  const admin = await requireAdmin()
  if (admin.error) return { pending: [], recent: [] }
  const supabase = createClient()
  const [pendingRes, recentRes] = await Promise.all([
    supabase.from('bank_transactions').select('*').eq('status', 'pending').order('transaction_date', { ascending: false }),
    supabase.from('bank_transactions').select('*, transactions(members(name))')
      .neq('status', 'pending').order('resolved_at', { ascending: false }).limit(30),
  ])
  if (pendingRes.error) throw new Error(pendingRes.error.message)
  if (recentRes.error) throw new Error(recentRes.error.message)

  const recent = (recentRes.data || []).map((row: any) => {
    const names = (row.transactions || []).map((t: any) => t.members?.name).filter(Boolean) as string[]
    return { ...row, transactions: undefined, member_names: Array.from(new Set(names)) }
  })
  return { pending: pendingRes.data || [], recent }
}

export async function assignBankTransaction(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = assignBankSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  const { bank_transaction_id, parts, remember_name } = parsed.data

  if (new Set(parts.map(p => p.member_id)).size !== parts.length) {
    return { success: false, error: 'Mỗi thành viên chỉ xuất hiện một lần' }
  }
  const loaded = await loadPending(bank_transaction_id)
  if ('error' in loaded) return { success: false, error: loaded.error! }
  const { supabase, tx } = loaded
  if (tx.transfer_type !== 'in') return { success: false, error: 'Chỉ gán thành viên cho khoản tiền vào' }
  if (parts.reduce((sum, p) => sum + p.amount, 0) !== tx.amount) {
    return { success: false, error: 'Tổng số tiền chia phải bằng số tiền giao dịch' }
  }

  try {
    const incomeParts = parts.map(p => ({ memberId: p.member_id, amount: p.amount }))
    const result = await applyIncome(supabase, tx, incomeParts, 'admin', null)
    if (!result.ok) return { success: false, error: REASON_MESSAGES[result.reason] }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }

  const name = remember_name ? normalizeText(remember_name) : ''
  if (name.length >= 2 && parts.length === 1) {
    // Learn the sender name; a name already linked to someone (unique) is left unchanged.
    await supabase.from('member_bank_identities').insert({ member_id: parts[0].member_id, kind: 'name', value: name })
  }

  revalidateFund()
  return { success: true }
}

/** Records a pending transaction as one ledger entry (other income, or an expense). */
export async function recordBankTransactionAs(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = resolveBankSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const loaded = await loadPending(parsed.data.bank_transaction_id)
  if ('error' in loaded) return { success: false, error: loaded.error! }
  const { error } = await loaded.supabase.rpc('apply_bank_simple', {
    p_bank_tx_id: loaded.tx.id, p_category: parsed.data.category,
    p_description: sanitizeContent(loaded.tx.content), p_matched_via: 'admin',
  })
  if (error) return { success: false, error: error.message }

  revalidateFund()
  return { success: true }
}

export async function ignoreBankTransaction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const supabase = createClient()
  const { data, error } = await supabase.from('bank_transactions')
    .update({ status: 'ignored', resolved_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'pending').select('id')
  if (error) return { success: false, error: error.message }
  if (!data?.length) return { success: false, error: 'Giao dịch đã được xử lý' }

  revalidateFund()
  return { success: true }
}

/** Undoes whatever a bank transaction produced and puts it back in the pending queue. */
export async function revertBankTransaction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const supabase = createClient()
  const { error } = await supabase.rpc('revert_bank_transaction', { p_bank_tx_id: id })
  if (error) {
    if (error.message.includes('bank_tx_already_pending')) return { success: false, error: 'Giao dịch đang ở hàng chờ' }
    return { success: false, error: error.message }
  }

  revalidateFund()
  return { success: true }
}
