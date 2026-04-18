'use client'

import { useState } from 'react'
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import type { TransactionWithMember } from '@/lib/types/database'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MobileSheet } from './mobile-sheet'
import { formatCurrency } from '@/lib/utils/format'
import { useToast } from '@/components/ui/toast'
import { deleteTransaction } from '@/app/quan-ly-quy/thu-chi/actions'

interface TransactionListProps {
  transactions: (TransactionWithMember & { running_balance: number })[]
  onEdit: (t: TransactionWithMember) => void
  isAuthenticated?: boolean
}

export function TransactionList({ transactions, onEdit, isAuthenticated = false }: TransactionListProps) {
  const { showToast } = useToast()
  const [detailTx, setDetailTx] = useState<(TransactionWithMember & { running_balance: number }) | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TransactionWithMember | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteTransaction(deleteTarget.id)
      if (result.success) {
        showToast('Đã xóa giao dịch')
        setDetailTx(null)
      } else {
        showToast(result.error, 'error')
      }
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
      <div className="space-y-2">
        {transactions.map(t => (
          <button
            key={t.id}
            onClick={() => setDetailTx(t)}
            className={`w-full rounded-xl bg-white p-3.5 shadow-card text-left transition-all active:bg-gray-50 border-l-4 ${
              t.type === 'income' ? 'border-emerald-400' : 'border-rose-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.description || t.category}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  <DateDisplay date={t.date} />
                  {t.member_name && ` · ${t.member_name}`}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <CurrencyDisplay amount={t.amount} type={t.type} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail sheet */}
      <MobileSheet
        open={!!detailTx}
        onClose={() => setDetailTx(null)}
        title={detailTx?.description || detailTx?.category || 'Giao dịch'}
      >
        {detailTx && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {detailTx.type === 'income' ? (
                <TrendingUp size={16} className="text-emerald-600" />
              ) : (
                <TrendingDown size={16} className="text-rose-600" />
              )}
              <span className="text-sm font-medium text-gray-600">
                {detailTx.type === 'income' ? 'Thu' : 'Chi'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Số tiền</p>
                <p className="text-sm font-semibold">
                  <CurrencyDisplay amount={detailTx.amount} type={detailTx.type} />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ngày</p>
                <p className="text-sm font-medium"><DateDisplay date={detailTx.date} /></p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Danh mục</p>
                <p className="text-sm font-medium">{detailTx.category}</p>
              </div>
              {detailTx.member_name && (
                <div>
                  <p className="text-xs text-gray-500">Người</p>
                  <p className="text-sm font-medium">{detailTx.member_name}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500">Số dư lũy kế</p>
              <p className="text-sm font-bold">
                <CurrencyDisplay
                  amount={detailTx.running_balance}
                  type={detailTx.running_balance >= 0 ? 'income' : 'expense'}
                />
              </p>
            </div>

            {detailTx.note && (
              <div>
                <p className="text-xs text-gray-500">Ghi chú</p>
                <p className="mt-0.5 text-sm text-gray-700">{detailTx.note}</p>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setDetailTx(null)
                    onEdit(detailTx)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Pencil size={14} />
                  Sửa
                </button>
                <button
                  onClick={() => setDeleteTarget(detailTx)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </MobileSheet>

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
