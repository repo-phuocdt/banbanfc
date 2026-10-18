'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { revertBankTransaction, type BankTransactionWithMembers } from '@/app/quan-ly-quy/dong-tien/bank-actions'
import { BankTxSummary } from './bank-tx-summary'
import { describeMatch } from '@/lib/notify/messages'

function describe(tx: BankTransactionWithMembers): string {
  if (tx.status === 'ignored') return 'Đã bỏ qua'
  const who = tx.member_names.length ? `Ghi cho ${tx.member_names.join(', ')}` : 'Đã ghi vào Thu chi'
  const via = tx.matched_via?.startsWith('name:') || tx.matched_via?.startsWith('account:')
    ? ` · tự nhận diện theo ${describeMatch(tx.matched_via)}`
    : tx.matched_via === 'admin' ? ' · admin ghi' : ''
  return `${who}${via}`
}

export function RecentBankItem({ tx }: { tx: BankTransactionWithMembers }) {
  const { showToast } = useToast()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRevert = async () => {
    setLoading(true)
    try {
      const result = await revertBankTransaction(tx.id)
      if (result.success) showToast('Đã hủy ghi nhận, giao dịch quay lại hàng chờ')
      else showToast(result.error, 'error')
    } catch {
      showToast('Đã có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-3 shadow-card">
      <BankTxSummary tx={tx} detail={describe(tx)} />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setConfirm(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
        >
          Hủy ghi nhận
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleRevert}
        title="Hủy ghi nhận"
        message="Các khoản đóng quỹ và thu chi do giao dịch này tạo ra sẽ bị xóa, giao dịch quay lại hàng chờ để gán lại."
        danger
        loading={loading}
      />
    </div>
  )
}
