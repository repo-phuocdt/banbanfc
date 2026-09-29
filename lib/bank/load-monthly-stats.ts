import type { SupabaseClient } from '@supabase/supabase-js'
import { monthOf } from './month'
import { buildBankMonthlyStats, windowStart, type BankMonthStats } from './monthly-stats'

export const BANK_STATS_MONTHS = 12

/** Last 12 months of bank activity; the caller must be an admin (bank data is admin-only in RLS). */
export async function loadBankMonthlyStats(db: SupabaseClient): Promise<BankMonthStats[]> {
  const lastMonth = monthOf(new Date())
  const since = `${windowStart(lastMonth, BANK_STATS_MONTHS)}-01T00:00:00+07:00`
  const { data, error } = await db
    .from('bank_transactions')
    .select('transaction_date, transfer_type, amount, status, transactions(category)')
    .gte('transaction_date', since)
  if (error) throw new Error(error.message)

  const rows = (data || []).map((r: any) => ({
    ...r,
    categories: (r.transactions || []).map((t: { category: string }) => t.category),
  }))
  return buildBankMonthlyStats(rows, lastMonth, BANK_STATS_MONTHS)
}
