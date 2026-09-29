import type { SupabaseClient } from '@supabase/supabase-js'
import type { BankTransaction } from '@/lib/types/database'
import { sendZalo } from '@/lib/notify/zalo'
import { quotaMessage } from '@/lib/notify/messages'
import { addMonths, monthOf } from './month'

// SePay FREE plan counts incoming transactions per calendar month.
export const SEPAY_FREE_LIMIT = 50
const WARN_AT = [45, 50]

/** Warns on Zalo when this month's incoming count reaches the warning thresholds. */
export async function notifyQuota(db: SupabaseClient, tx: BankTransaction): Promise<void> {
  const month = monthOf(new Date(tx.transaction_date))
  const start = new Date(`${month}-01T00:00:00+07:00`).toISOString()
  const end = new Date(`${addMonths(month, 1)}-01T00:00:00+07:00`).toISOString()
  const { count, error } = await db
    .from('bank_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('transfer_type', 'in')
    .gte('transaction_date', start)
    .lt('transaction_date', end)
  if (error || count === null) return
  if (WARN_AT.includes(count)) await sendZalo(quotaMessage(count, SEPAY_FREE_LIMIT))
}
