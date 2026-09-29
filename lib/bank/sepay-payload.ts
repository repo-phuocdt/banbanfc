import { z } from 'zod'

// SePay webhook body: https://docs.sepay.vn/tich-hop-webhooks.html
export const sepayPayloadSchema = z.object({
  id: z.coerce.number().int().positive(),
  gateway: z.string().nullish(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  accountNumber: z.string().min(1),
  content: z.string().nullish(),
  description: z.string().nullish(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.coerce.number().int().positive(),
  referenceCode: z.string().nullish(),
})

export type SepayPayload = z.infer<typeof sepayPayloadSchema>

/** SePay sends bank-local time ("2026-09-10 14:02:37"); banks here run on UTC+7. */
export function sepayDateToIso(transactionDate: string): string {
  return new Date(`${transactionDate.replace(' ', 'T')}+07:00`).toISOString()
}

export function toBankTransactionRow(p: SepayPayload, raw: unknown) {
  return {
    sepay_id: p.id,
    gateway: p.gateway ?? null,
    transaction_date: sepayDateToIso(p.transactionDate),
    account_number: p.accountNumber,
    transfer_type: p.transferType,
    amount: p.transferAmount,
    content: p.content || p.description || '',
    reference_code: p.referenceCode || null,
    raw,
  }
}
