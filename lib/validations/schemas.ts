import { z } from 'zod'

export const memberStatusSchema = z.enum(['active', 'inactive', 'paused'])

export const memberSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  status: memberStatusSchema,
  note: z.string().optional().nullable(),
})

export const contributionSchema = z.object({
  member_id: z.string().uuid('ID thành viên không hợp lệ'),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Tháng phải có dạng YYYY-MM'),
  amount: z.number().int().positive('Số tiền phải lớn hơn 0'),
  paid_at: z.string().optional(),
  note: z.string().optional().nullable(),
})

export const transactionSchema = z.object({
  date: z.string().optional().nullable(),
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive('Số tiền phải lớn hơn 0'),
  category: z.string().min(1, 'Danh mục không được để trống'),
  description: z.string().default(''),
  member_id: z.string().uuid().optional().nullable(),
  note: z.string().optional().nullable(),
})

const ALLOWED_QR_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

export const qrCodeSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(120, 'Tiêu đề quá dài'),
  bank_name: z.string().max(120).optional().nullable(),
  account_name: z.string().max(120).optional().nullable(),
  account_number: z.string().max(60).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  image_data: z
    .string()
    .min(1, 'Vui lòng chọn ảnh QR')
    .refine(
      val => /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(val),
      'Định dạng ảnh không hợp lệ'
    )
    .refine(val => val.length < 1_500_000, 'Ảnh quá lớn, vui lòng chọn ảnh dưới 1MB'),
  image_mime: z.enum(ALLOWED_QR_MIMES).default('image/png'),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export type MemberFormData = z.infer<typeof memberSchema>
export type ContributionFormData = z.infer<typeof contributionSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
export type QrCodeFormData = z.infer<typeof qrCodeSchema>
