import type { SupabaseClient } from '@supabase/supabase-js'
import type { BankTransaction } from '@/lib/types/database'
import { DEFAULT_CONTRIBUTION, MAX_MONTHS_AHEAD } from '@/lib/utils/constants'
import { allocate } from './allocate'
import { addMonths, monthOf } from './month'

export interface IncomePart {
  memberId: string
  amount: number
}

export interface AppliedAllocation {
  member_id: string
  month: string
  amount: number
  expected_paid: number
}

export type ApplyIncomeResult =
  | { ok: true; allocations: AppliedAllocation[] }
  | { ok: false; reason: 'invalid_amount' | 'over_threshold' | 'overflow' }

const MAX_ATTEMPTS = 3

/**
 * Splits a pending incoming bank transaction into monthly contributions for one or more
 * members and records it atomically. Recomputes when a concurrent write made the plan stale.
 */
export async function applyIncome(
  db: SupabaseClient,
  tx: BankTransaction,
  parts: IncomePart[],
  matchedVia: string,
  maxAutoAmount: number | null,
): Promise<ApplyIncomeResult> {
  const refMonth = monthOf(new Date(tx.transaction_date))
  const fromMonth = addMonths(refMonth, -1)
  const memberIds = parts.map(p => p.memberId)

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const [contribRes, leaveRes, memberRes] = await Promise.all([
      db.from('contributions').select('member_id, month, amount').in('member_id', memberIds).gte('month', fromMonth),
      db.from('member_leaves').select('member_id, month').in('member_id', memberIds).gte('month', fromMonth),
      db.from('members').select('id, joined_at').in('id', memberIds),
    ])
    if (contribRes.error) throw new Error(contribRes.error.message)
    if (leaveRes.error) throw new Error(leaveRes.error.message)
    if (memberRes.error) throw new Error(memberRes.error.message)

    const allocations: AppliedAllocation[] = []
    for (const part of parts) {
      const paidByMonth: Record<string, number> = {}
      contribRes.data
        .filter(c => c.member_id === part.memberId)
        .forEach(c => { paidByMonth[c.month] = (paidByMonth[c.month] ?? 0) + c.amount })
      const leaveMonths = new Set(leaveRes.data.filter(l => l.member_id === part.memberId).map(l => l.month))
      const joinedAt = memberRes.data.find(m => m.id === part.memberId)?.joined_at
      const joinedMonth = joinedAt ? monthOf(new Date(joinedAt)) : undefined

      const result = allocate({
        amount: part.amount, refMonth, paidByMonth, leaveMonths, joinedMonth,
        fee: DEFAULT_CONTRIBUTION, maxAhead: MAX_MONTHS_AHEAD, maxAutoAmount,
      })
      if (!result.ok) return result
      allocations.push(...result.allocations.map(a => ({
        member_id: part.memberId, month: a.month, amount: a.amount, expected_paid: a.expectedPaid,
      })))
    }

    const { error } = await db.rpc('apply_bank_income', {
      p_bank_tx_id: tx.id, p_allocations: allocations, p_matched_via: matchedVia,
    })
    if (!error) return { ok: true, allocations }
    if (!error.message.includes('stale_allocation') || attempt === MAX_ATTEMPTS) throw new Error(error.message)
  }
  throw new Error('unreachable')
}
