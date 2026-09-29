'use client'

import { useState } from 'react'
import { StandaloneSelect } from '@/components/ui/select-field'
import { useToast } from '@/components/ui/toast'
import { ignoreBankTransaction, recordBankTransactionAs } from '@/app/quan-ly-quy/dong-tien/bank-actions'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/utils/constants'
import { BankTxSummary } from './bank-tx-summary'
import type { BankTransaction } from '@/lib/types/database'

interface Props {
  tx: BankTransaction
  onAssign: (tx: BankTransaction) => void
}

export function PendingBankItem({ tx, onAssign }: Props) {
  const { showToast } = useToast()
  const isIncome = tx.transfer_type === 'in'
  const categories = (isIncome ? INCOME_CATEGORIES.filter(c => c !== 'Quỹ hàng tháng') : EXPENSE_CATEGORIES)
    .map(c => ({ value: c, label: c }))
  const [category, setCategory] = useState<string>(isIncome ? 'Góp thêm' : 'Khác')
  const [loading, setLoading] = useState(false)

  const run = async (action: () => Promise<{ success: boolean; error?: string }>, done: string) => {
    setLoading(true)
    try {
      const result = await action()
      if (result.success) showToast(done)
      else showToast(result.error ?? 'Đã có lỗi xảy ra', 'error')
    } catch {
      showToast('Đã có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-3 shadow-card">
      <BankTxSummary tx={tx} detail={tx.pending_reason ?? 'Chờ xử lý'} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isIncome && (
          <button
            onClick={() => onAssign(tx)}
            disabled={loading}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            Gán thành viên
          </button>
        )}
        <div className="w-40">
          <StandaloneSelect value={category} onChange={setCategory} options={categories} />
        </div>
        <button
          onClick={() => run(() => recordBankTransactionAs({ bank_transaction_id: tx.id, category }), 'Đã ghi vào Thu chi')}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {isIncome ? 'Ghi thu' : 'Ghi chi'}
        </button>
        <button
          onClick={() => run(() => ignoreBankTransaction(tx.id), 'Đã bỏ qua giao dịch')}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  )
}
