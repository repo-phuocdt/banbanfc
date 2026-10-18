import type { SupabaseClient } from '@supabase/supabase-js'
import type { BankTransaction, Member } from '@/lib/types/database'
import { applyIncome } from './apply-income'
import { guessExpenseCategory, isReversal } from './expense-category'
import { matchMember, type BankIdentity } from './match-member'
import { sanitizeContent } from './normalize'

export type ProcessOutcome =
  | { kind: 'income'; memberName: string; months: string[]; via: string }
  | { kind: 'expense'; category: string }
  | { kind: 'pending'; reason: string }

export const PENDING_REASONS = {
  none: 'Không nhận diện được người chuyển',
  ambiguous: 'Khớp nhiều thành viên',
  invalid_amount: 'Số tiền không hợp lệ',
  non_standard_amount: 'Số tiền khác mức quỹ tháng, cần admin xử lý',
  overflow: 'Vượt quá số tháng được đóng trước',
  reversal: 'Có thể là hoàn tiền hoặc tra soát',
} as const

/** Applies a freshly recorded (pending) bank transaction automatically, or leaves it for an admin. */
export async function processBankTransaction(
  db: SupabaseClient,
  tx: BankTransaction,
  fundHolderName?: string,
): Promise<ProcessOutcome> {
  if (tx.transfer_type === 'out') {
    if (isReversal(tx.content)) return markPending(db, tx.id, PENDING_REASONS.reversal)
    const category = guessExpenseCategory(tx.content)
    const { error } = await db.rpc('apply_bank_simple', {
      p_bank_tx_id: tx.id, p_category: category,
      p_description: sanitizeContent(tx.content), p_matched_via: 'auto:expense',
    })
    if (error) throw new Error(error.message)
    return { kind: 'expense', category }
  }

  const [membersRes, identitiesRes] = await Promise.all([
    db.from('members').select('id, name, status'),
    db.from('member_bank_identities').select('member_id, kind, value'),
  ])
  if (membersRes.error) throw new Error(membersRes.error.message)
  if (identitiesRes.error) throw new Error(identitiesRes.error.message)

  const members = membersRes.data as Pick<Member, 'id' | 'name' | 'status'>[]
  const eligible = new Set(members.filter(m => m.status !== 'inactive' && m.status !== 'deleted').map(m => m.id))
  const match = matchMember(tx.content, identitiesRes.data as BankIdentity[], eligible, fundHolderName)
  if (match.memberId === null) return markPending(db, tx.id, PENDING_REASONS[match.reason])
  // Only an exact monthly fee is auto-applied; any other amount is split or recorded by an admin.
  const result = await applyIncome(db, tx, [{ memberId: match.memberId, amount: tx.amount }], match.via, true)
  if (!result.ok) return markPending(db, tx.id, PENDING_REASONS[result.reason])

  const memberName = members.find(m => m.id === match.memberId)?.name ?? ''
  return { kind: 'income', memberName, months: result.allocations.map(a => a.month), via: match.via }
}

async function markPending(db: SupabaseClient, id: string, reason: string): Promise<ProcessOutcome> {
  const { error } = await db.from('bank_transactions').update({ pending_reason: reason }).eq('id', id).eq('status', 'pending')
  if (error) throw new Error(error.message)
  return { kind: 'pending', reason }
}
