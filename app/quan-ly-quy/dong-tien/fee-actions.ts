'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { loadFeeSchedule } from '@/lib/bank/fee-schedule'
import { monthlyFeeSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { MonthlyFee } from '@/lib/types/database'

export async function getMonthlyFees(): Promise<MonthlyFee[]> {
  return loadFeeSchedule(createClient())
}

/** Sets the fee from a month onward; saving an existing month replaces its amount. */
export async function saveMonthlyFee(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = monthlyFeeSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('monthly_fees').upsert(parsed.data, { onConflict: 'effective_month' })
  if (error) return { success: false, error: error.message }

  revalidatePath('/quan-ly-quy/dong-tien')
  return { success: true }
}

export async function deleteMonthlyFee(effectiveMonth: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  const supabase = createClient()
  const { count, error: countError } = await supabase.from('monthly_fees').select('*', { count: 'exact', head: true })
  if (countError) return { success: false, error: countError.message }
  if ((count ?? 0) <= 1) return { success: false, error: 'Phải giữ lại ít nhất một mức quỹ' }

  const { error } = await supabase.from('monthly_fees').delete().eq('effective_month', effectiveMonth)
  if (error) return { success: false, error: error.message }

  revalidatePath('/quan-ly-quy/dong-tien')
  return { success: true }
}
