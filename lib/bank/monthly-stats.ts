import { addMonths, monthOf } from './month'

export type BankStatus = 'pending' | 'applied' | 'ignored'

export interface BankStatRow {
  transaction_date: string
  transfer_type: 'in' | 'out'
  amount: number
  status: BankStatus
  /** Categories of the ledger rows the transaction created (empty unless applied). */
  categories: string[]
}

export interface InOut {
  in: number
  out: number
}

export interface BankMonthStats {
  month: string
  in: number
  out: number
  inCount: number
  outCount: number
  byStatus: Record<BankStatus, InOut>
  /** Outgoing money per expense category, largest first. */
  outByCategory: { category: string; amount: number }[]
}

export const UNCATEGORIZED = 'Chưa phân loại'

function emptyMonth(month: string): BankMonthStats {
  return {
    month,
    in: 0,
    out: 0,
    inCount: 0,
    outCount: 0,
    byStatus: { pending: { in: 0, out: 0 }, applied: { in: 0, out: 0 }, ignored: { in: 0, out: 0 } },
    outByCategory: [],
  }
}

/** First month of the window ending at `lastMonth` (inclusive), for the date filter. */
export function windowStart(lastMonth: string, size: number): string {
  return addMonths(lastMonth, -(size - 1))
}

/**
 * Totals money in/out of the bank account for each of the `size` months ending at
 * `lastMonth` (Vietnam time), oldest first. Months without transactions are zero.
 */
export function buildBankMonthlyStats(rows: BankStatRow[], lastMonth: string, size: number): BankMonthStats[] {
  const months = Array.from({ length: size }, (_, i) => emptyMonth(windowStart(lastMonth, size - i)))
  const byMonth = new Map(months.map(m => [m.month, m]))
  const categoryTotals = new Map<string, Map<string, number>>()

  for (const row of rows) {
    const stats = byMonth.get(monthOf(new Date(row.transaction_date)))
    if (!stats) continue
    const side = row.transfer_type
    stats[side] += row.amount
    stats[side === 'in' ? 'inCount' : 'outCount'] += 1
    stats.byStatus[row.status][side] += row.amount
    if (side === 'out') {
      // One outgoing transfer creates at most one expense row.
      const category = row.categories[0] ?? UNCATEGORIZED
      const totals = categoryTotals.get(stats.month) ?? new Map<string, number>()
      totals.set(category, (totals.get(category) ?? 0) + row.amount)
      categoryTotals.set(stats.month, totals)
    }
  }

  for (const [month, totals] of Array.from(categoryTotals)) {
    byMonth.get(month)!.outByCategory = Array.from(totals, ([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }
  return months
}
