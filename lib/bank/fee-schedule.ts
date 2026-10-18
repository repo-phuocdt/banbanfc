import type { SupabaseClient } from '@supabase/supabase-js'
import type { MonthlyFee } from '@/lib/types/database'

/**
 * Fee owed for a month: the latest schedule row effective on or before it. Months earlier than
 * the first row use the first row's amount. An empty schedule yields 0.
 */
export function feeForMonth(schedule: MonthlyFee[], month: string): number {
  let earliest: MonthlyFee | undefined
  let current: MonthlyFee | undefined
  for (const row of schedule) {
    if (!earliest || row.effective_month < earliest.effective_month) earliest = row
    if (row.effective_month <= month && (!current || row.effective_month > current.effective_month)) current = row
  }
  return (current ?? earliest)?.amount ?? 0
}

export async function loadFeeSchedule(db: SupabaseClient): Promise<MonthlyFee[]> {
  const { data, error } = await db.from('monthly_fees').select('effective_month, amount').order('effective_month')
  if (error) throw new Error(error.message)
  return (data || []) as MonthlyFee[]
}
