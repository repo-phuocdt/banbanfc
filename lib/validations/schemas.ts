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

const monthField = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Tháng phải có dạng YYYY-MM')

export const leaveSchema = z.object({
  member_id: z.string().uuid('ID thành viên không hợp lệ'),
  month: monthField,
  note: z.string().max(200).optional().nullable(),
})

export const monthlyFeeSchema = z.object({
  effective_month: monthField,
  amount: z.number({ invalid_type_error: 'Số tiền phải là số' }).int('Số tiền phải là số nguyên').positive('Số tiền phải lớn hơn 0'),
})

export const memberIdentitiesSchema = z.object({
  names: z.array(z.string().trim().min(2, 'Tên chuyển tiền quá ngắn').max(60, 'Tên chuyển tiền quá dài')).max(10),
  accounts: z.array(z.string().regex(/^\d{6,20}$/, 'Số tài khoản chỉ gồm 6–20 chữ số')).max(10),
})

export const assignBankSchema = z.object({
  bank_transaction_id: z.string().uuid(),
  parts: z.array(z.object({
    member_id: z.string().uuid('Vui lòng chọn thành viên'),
    amount: z.number().int().positive('Số tiền phải lớn hơn 0'),
  })).min(1, 'Chọn ít nhất một thành viên').max(10),
  remember_name: z.string().trim().max(60).optional().nullable(),
})

export const resolveBankSchema = z.object({
  bank_transaction_id: z.string().uuid(),
  category: z.string().min(1, 'Danh mục không được để trống'),
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
