'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { digitsOnly, normalizeText } from '@/lib/bank/normalize'
import { memberIdentitiesSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'

export interface MemberIdentities {
  names: string[]
  accounts: string[]
}

/** Admin-only: sender names and account numbers of a member; null when they could not be loaded. */
export async function getMemberIdentities(memberId: string): Promise<MemberIdentities | null> {
  const admin = await requireAdmin()
  if (admin.error) return null
  const supabase = await createClient()
  const { data, error } = await supabase.from('member_bank_identities').select('kind, value')
    .eq('member_id', memberId).order('created_at')
  if (error) return null
  return {
    names: (data || []).filter(i => i.kind === 'name').map(i => i.value),
    accounts: (data || []).filter(i => i.kind === 'account').map(i => i.value),
  }
}

/** Replaces a member's identities with the given lists. */
export async function saveMemberIdentities(memberId: string, formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = memberIdentitiesSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const wanted = [
    ...Array.from(new Set(parsed.data.names.map(normalizeText).filter(v => v.length >= 2))).map(value => ({ kind: 'name', value })),
    ...Array.from(new Set(parsed.data.accounts.map(digitsOnly))).map(value => ({ kind: 'account', value })),
  ]

  const supabase = await createClient()
  const { data: current, error: readError } = await supabase.from('member_bank_identities')
    .select('id, kind, value').eq('member_id', memberId)
  if (readError) return { success: false, error: readError.message }

  const keyOf = (i: { kind: string; value: string }) => `${i.kind}:${i.value}`
  const wantedKeys = new Set(wanted.map(keyOf))
  const currentKeys = new Set((current || []).map(keyOf))
  const toDelete = (current || []).filter(i => !wantedKeys.has(keyOf(i))).map(i => i.id)
  const toInsert = wanted.filter(i => !currentKeys.has(keyOf(i))).map(i => ({ ...i, member_id: memberId }))

  // Insert first so a conflict leaves the existing identities untouched.
  if (toInsert.length) {
    const { error } = await supabase.from('member_bank_identities').insert(toInsert)
    if (error) {
      if (error.code === '23505') return { success: false, error: 'Tên chuyển tiền hoặc số tài khoản đã thuộc về thành viên khác' }
      return { success: false, error: error.message }
    }
  }
  if (toDelete.length) {
    const { error } = await supabase.from('member_bank_identities').delete().in('id', toDelete)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/quan-ly-quy/thanh-vien')
  return { success: true }
}
