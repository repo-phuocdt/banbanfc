'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { TransactionWithMember } from '@/lib/types/database'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { deleteTransaction } from '@/app/quan-ly-quy/thu-chi/actions'

interface Props {
  transactions: (TransactionWithMember & { running_balance: number })[]
  onEdit: (t: TransactionWithMember) => void
  isAuthenticated?: boolean
}

export function TransactionTable({ transactions, onEdit, isAuthenticated = false }: Props) {
  const { showToast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<TransactionWithMember | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteTransaction(deleteTarget.id)
      if (result.success) showToast('Đã xóa giao dịch')
      else showToast(result.error, 'error')
    } catch {
      showToast('Lỗi khi xóa', 'error')
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  if (transactions.length === 0) {
    return <EmptyState title="Không có giao dịch" description="Chưa có giao dịch nào phù hợp" />
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50/80 text-left text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3 w-10">STT</th>
              <th className="px-3 py-3">Ngày</th>
              <th className="px-3 py-3 text-right">Thu</th>
              <th className="px-3 py-3 text-right">Chi</th>
              <th className="hidden px-3 py-3 sm:table-cell">Nội dung</th>
              <th className="hidden px-3 py-3 md:table-cell">Người</th>
              <th className="hidden px-3 py-3 text-right lg:table-cell">Số dư lũy kế</th>
              {isAuthenticated && <th className="px-3 py-3 w-20"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t, i) => (
              <tr
                key={t.id}
                className={`transition-colors hover:bg-gray-50 ${t.type === 'income' ? 'bg-income-bg/30' : 'bg-expense-bg/30'}`}
              >
                <td className="px-3 py-2.5 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2.5 whitespace-nowrap"><DateDisplay date={t.date} /></td>
                <td className="px-3 py-2.5 text-right">
                  {t.type === 'income' && <CurrencyDisplay amount={t.amount} type="income" />}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {t.type === 'expense' && <CurrencyDisplay amount={t.amount} type="expense" />}
                </td>
                <td className="hidden px-3 py-2.5 sm:table-cell">
                  <div className="max-w-[200px] truncate">{t.description || t.category}</div>
                  {t.note && <div className="max-w-[200px] truncate text-xs text-gray-400">{t.note}</div>}
                </td>
                <td className="hidden px-3 py-2.5 text-gray-600 md:table-cell">{t.member_name || '—'}</td>
                <td className="hidden px-3 py-2.5 text-right font-medium lg:table-cell">
                  <CurrencyDisplay
                    amount={t.running_balance}
                    type={t.running_balance >= 0 ? 'income' : 'expense'}
                  />
                </td>
                {isAuthenticated && (
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="rounded p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa giao dịch"
        message={`Bạn có chắc muốn xóa giao dịch "${deleteTarget?.description || deleteTarget?.category}"?`}
        danger
        loading={loading}
      />
    </>
  )
}
