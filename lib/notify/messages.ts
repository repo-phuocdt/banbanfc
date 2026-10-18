import type { ProcessOutcome } from '@/lib/bank/process-bank-transaction'
import { sanitizeContent } from '@/lib/bank/normalize'
import { formatCurrency, formatMonth } from '@/lib/utils/format'

interface TxInfo {
  amount: number
  content: string
  transactionDate: string // ISO
}

const time = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })

const money = (amount: number) => `${formatCurrency(amount)}đ`

export function outcomeMessage(outcome: ProcessOutcome, tx: TxInfo): string {
  switch (outcome.kind) {
    case 'income': {
      const months = Array.from(new Set(outcome.months)).map(formatMonth).join(', ')
      return `✅ ${outcome.memberName} đã đóng ${months} (${money(tx.amount)}) — nhận diện theo ${describeMatch(outcome.via)}`
    }
    case 'expense':
      return `💸 Chi ${money(tx.amount)} — ${outcome.category}: "${sanitizeContent(tx.content)}"`
    case 'pending':
      return `🕓 Nhận ${money(tx.amount)} — "${sanitizeContent(tx.content)}" — ${outcome.reason}. Admin vào app để xử lý.`
  }
}

/** "name:DINH TAN PHUOC" → "tên DINH TAN PHUOC"; account numbers are masked (the chat may be the team group). */
export function describeMatch(via: string): string {
  const [kind, ...rest] = via.split(':')
  const value = rest.join(':')
  if (kind === 'account') return `số TK …${value.slice(-4)}`
  if (kind === 'name') return `tên ${value}`
  return value
}

export function duplicateReferenceMessage(tx: TxInfo): string {
  return `ℹ️ Bỏ qua giao dịch ${money(tx.amount)} lúc ${time(tx.transactionDate)} vì trùng mã tham chiếu với giao dịch đã ghi. Kiểm tra trên my.sepay.vn nếu thấy thiếu tiền.`
}

export function failureMessage(tx: TxInfo): string {
  return `⚠️ SePay đã nhận ${money(tx.amount)} lúc ${time(tx.transactionDate)} — "${sanitizeContent(tx.content)}" — CHƯA ghi được vào app. Hệ thống sẽ tự thử lại trong 5 giờ.`
}

export function recoveredMessage(tx: TxInfo): string {
  return `✅ Đã ghi bù giao dịch ${money(tx.amount)} lúc ${time(tx.transactionDate)}.`
}

export function invalidPayloadMessage(): string {
  return '⚠️ Nhận webhook SePay không đúng định dạng, giao dịch CHƯA được ghi. Kiểm tra lịch sử giao dịch trên my.sepay.vn.'
}

export function quotaMessage(count: number, limit: number): string {
  return `ℹ️ Tháng này đã có ${count}/${limit} giao dịch tiền vào (giới hạn gói SePay miễn phí).`
}
