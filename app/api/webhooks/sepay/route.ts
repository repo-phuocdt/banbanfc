import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { sepayPayloadSchema, toBankTransactionRow } from '@/lib/bank/sepay-payload'
import { processBankTransaction } from '@/lib/bank/process-bank-transaction'
import { notifyQuota } from '@/lib/bank/sepay-quota'
import { sendZalo } from '@/lib/notify/zalo'
import { claimFailureAlert, consumeFailureAlert } from '@/lib/notify/alert-once'
import { duplicateReferenceMessage, failureMessage, invalidPayloadMessage, outcomeMessage, recoveredMessage } from '@/lib/notify/messages'
import type { BankTransaction } from '@/lib/types/database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ok = () => NextResponse.json({ success: true })

function isAuthorized(header: string | null): boolean {
  const key = process.env.SEPAY_WEBHOOK_API_KEY
  if (!key || !header) return false
  const expected = Buffer.from(`Apikey ${key}`)
  const actual = Buffer.from(header)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get('authorization'))) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = sepayPayloadSchema.safeParse(body)
  if (!parsed.success) {
    console.error('[sepay-webhook] invalid payload', parsed.error.issues.map(i => i.path.join('.')))
    await sendZalo(invalidPayloadMessage())
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const payload = parsed.data
  const fundAccount = process.env.FUND_BANK_ACCOUNT
  if (fundAccount && payload.accountNumber !== fundAccount) return ok() // another linked account

  const row = toBankTransactionRow(payload, body)
  const info = { amount: row.amount, content: row.content, transactionDate: row.transaction_date }

  try {
    const db = createServiceClient()
    const { error: insertError } = await db.from('bank_transactions').insert(row)
    if (insertError && insertError.code !== '23505') throw new Error(insertError.message)

    const { data: tx, error: readError } = await db
      .from('bank_transactions').select('*').eq('sepay_id', row.sepay_id).maybeSingle<BankTransaction>()
    if (readError) throw new Error(readError.message)
    if (!tx) {
      // Same (account, reference code) already stored under another SePay id: skip, but never silently.
      console.warn('[sepay-webhook] duplicate reference code, skipped', payload.id)
      await sendZalo(duplicateReferenceMessage(info))
      return ok()
    }
    if (tx.status !== 'pending' || tx.pending_reason) {
      // Duplicate or already handled (e.g. a previous attempt wrote it but the response was lost).
      if (await consumeFailureAlert(payload.id)) await sendZalo(recoveredMessage(info))
      return ok()
    }

    const outcome = await processBankTransaction(db, tx, process.env.FUND_ACCOUNT_HOLDER_NAME)

    revalidatePath('/quan-ly-quy', 'layout')
    const recovered = await consumeFailureAlert(payload.id)
    await sendZalo(recovered ? `${recoveredMessage(info)}\n${outcomeMessage(outcome, info)}` : outcomeMessage(outcome, info))
    if (tx.transfer_type === 'in' && !insertError) await notifyQuota(db, tx)
    return ok()
  } catch (error) {
    const message = (error as Error).message
    // A concurrent retry already applied this transaction: nothing was lost.
    if (message.includes('bank_tx_not_pending')) return ok()
    console.error('[sepay-webhook] failed', payload.id, message)
    if (await claimFailureAlert(payload.id)) await sendZalo(failureMessage(info))
    return NextResponse.json({ success: false }, { status: 500 }) // SePay retries
  }
}
