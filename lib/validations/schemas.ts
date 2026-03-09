import { z } from 'zod'

export const memberSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  status: z.enum(['active', 'inactive', 'paused']),
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

export type MemberFormData = z.infer<typeof memberSchema>
export type ContributionFormData = z.infer<typeof contributionSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
