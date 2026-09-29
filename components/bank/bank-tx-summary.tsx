import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { BankTransaction } from '@/lib/types/database'

interface Props {
  tx: BankTransaction
  detail: string
}

/** One bank transaction: date, signed amount, raw content, and a status/detail line. */
export function BankTxSummary({ tx, detail }: Props) {
  const isIncome = tx.transfer_type === 'in'
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">{formatDate(tx.transaction_date)}</span>
        <span className={`text-sm font-semibold ${isIncome ? 'text-income-text' : 'text-rose-600'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}đ
        </span>
      </div>
      <p className="mt-1 break-words text-sm text-gray-800">{tx.content || '(không có nội dung)'}</p>
      <p className="mt-0.5 text-xs text-amber-700">{detail}</p>
    </div>
  )
}
