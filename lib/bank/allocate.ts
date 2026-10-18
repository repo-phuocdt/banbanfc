import { addMonths } from './month'

export interface Allocation {
  month: string
  amount: number
  expectedPaid: number
}

export type AllocateResult =
  | { ok: true; allocations: Allocation[] }
  | { ok: false; reason: 'invalid_amount' | 'non_standard_amount' | 'overflow' }

export interface AllocateInput {
  amount: number
  /** Month the transfer happened in ('YYYY-MM', Vietnam time). */
  refMonth: string
  /** Amount already paid per month for this member. */
  paidByMonth: Record<string, number>
  leaveMonths: Set<string>
  /** Month the member joined; earlier months count as settled and are never filled. */
  joinedMonth?: string
  /** Fee owed for a month. */
  feeFor: (month: string) => number
  /** How many months after refMonth may be prepaid. */
  maxAhead: number
  /** Auto-apply mode: only an amount equal to the first filled month's fee is accepted. */
  exactFee: boolean
}

/**
 * Fills months starting from the month before the transfer (never before the member joined),
 * topping up partial months first, skipping leave months, and carrying any remainder into the
 * next month as a partial payment.
 */
export function allocate(input: AllocateInput): AllocateResult {
  const { amount, refMonth, paidByMonth, leaveMonths, joinedMonth, feeFor, maxAhead, exactFee } = input
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, reason: 'invalid_amount' }

  const allocations: Allocation[] = []
  let remaining = amount
  for (let offset = -1; offset <= maxAhead && remaining > 0; offset++) {
    const month = addMonths(refMonth, offset)
    if (leaveMonths.has(month) || (joinedMonth && month < joinedMonth)) continue
    const paid = paidByMonth[month] ?? 0
    const fee = feeFor(month)
    if (paid >= fee) continue
    const take = Math.min(fee - paid, remaining)
    allocations.push({ month, amount: take, expectedPaid: paid })
    remaining -= take
  }

  if (exactFee && allocations.length > 0 && amount !== feeFor(allocations[0].month)) {
    return { ok: false, reason: 'non_standard_amount' }
  }
  if (remaining > 0) return { ok: false, reason: 'overflow' }
  return { ok: true, allocations }
}
