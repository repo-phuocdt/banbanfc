import { addMonths } from './month'

export interface Allocation {
  month: string
  amount: number
  expectedPaid: number
}

export type AllocateResult =
  | { ok: true; allocations: Allocation[] }
  | { ok: false; reason: 'invalid_amount' | 'over_threshold' | 'overflow' }

export interface AllocateInput {
  amount: number
  /** Month the transfer happened in ('YYYY-MM', Vietnam time). */
  refMonth: string
  /** Amount already paid per month for this member. */
  paidByMonth: Record<string, number>
  leaveMonths: Set<string>
  /** Month the member joined; earlier months count as settled and are never filled. */
  joinedMonth?: string
  fee: number
  /** How many months after refMonth may be prepaid. */
  maxAhead: number
  /** Transfers above this are not auto-applied; null disables the check (admin assignment). */
  maxAutoAmount: number | null
}

/**
 * Fills months starting from the month before the transfer (never before the member joined),
 * topping up partial months first, skipping leave months, and carrying any remainder into the
 * next month as a partial payment.
 */
export function allocate(input: AllocateInput): AllocateResult {
  const { amount, refMonth, paidByMonth, leaveMonths, joinedMonth, fee, maxAhead, maxAutoAmount } = input
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, reason: 'invalid_amount' }
  if (maxAutoAmount !== null && amount > maxAutoAmount) return { ok: false, reason: 'over_threshold' }

  const allocations: Allocation[] = []
  let remaining = amount
  for (let offset = -1; offset <= maxAhead && remaining > 0; offset++) {
    const month = addMonths(refMonth, offset)
    if (leaveMonths.has(month) || (joinedMonth && month < joinedMonth)) continue
    const paid = paidByMonth[month] ?? 0
    if (paid >= fee) continue
    const take = Math.min(fee - paid, remaining)
    allocations.push({ month, amount: take, expectedPaid: paid })
    remaining -= take
  }

  if (remaining > 0) return { ok: false, reason: 'overflow' }
  return { ok: true, allocations }
}
