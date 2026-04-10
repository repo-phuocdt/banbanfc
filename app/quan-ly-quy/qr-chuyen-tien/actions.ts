'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { qrCodeSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'
import type { QrCode } from '@/lib/types/database'

export async function getQrCodes(): Promise<QrCode[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export async function getPrimaryQrCode(): Promise<QrCode | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data || null
}

function revalidateAll() {
  revalidatePath('/quan-ly-quy/qr-chuyen-tien')
  revalidatePath('/quan-ly-quy')
  revalidatePath('/')
}

export async function createQrCode(formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = qrCodeSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase.from('qr_codes').insert({
    title: parsed.data.title,
    bank_name: parsed.data.bank_name || null,
    account_name: parsed.data.account_name || null,
    account_number: parsed.data.account_number || null,
    description: parsed.data.description || null,
    image_data: parsed.data.image_data,
    image_mime: parsed.data.image_mime,
    display_order: parsed.data.display_order,
    is_active: parsed.data.is_active,
  })

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

export async function updateQrCode(id: string, formData: unknown): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error
  const parsed = qrCodeSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const supabase = createClient()
  const { error } = await supabase
    .from('qr_codes')
    .update({
      title: parsed.data.title,
      bank_name: parsed.data.bank_name || null,
      account_name: parsed.data.account_name || null,
      account_number: parsed.data.account_number || null,
      description: parsed.data.description || null,
      image_data: parsed.data.image_data,
      image_mime: parsed.data.image_mime,
      display_order: parsed.data.display_order,
      is_active: parsed.data.is_active,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

export async function deleteQrCode(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.error) return admin.error

  const supabase = createClient()
  const { error } = await supabase.from('qr_codes').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}
