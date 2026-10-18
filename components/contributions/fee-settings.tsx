'use client'

import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { deleteMonthlyFee, saveMonthlyFee } from '@/app/quan-ly-quy/dong-tien/fee-actions'
import { feeForMonth } from '@/lib/bank/fee-schedule'
import { monthOf } from '@/lib/bank/month'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import type { ActionResult } from '@/lib/types/action-result'
import type { MonthlyFee } from '@/lib/types/database'

interface Props {
  fees: MonthlyFee[]
}

// Admin-only and small, so one responsive component serves both desktop and mobile.
export function FeeSettings({ fees }: Props) {
  const { showToast } = useToast()
  const currentMonth = monthOf(new Date())
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(currentMonth)
  const [amount, setAmount] = useState(feeForMonth(fees, currentMonth))
  const [loading, setLoading] = useState(false)

  const run = async (action: () => Promise<ActionResult>, done: string) => {
    setLoading(true)
    try {
      const result = await action()
      if (result.success) showToast(done)
      else showToast(result.error, 'error')
    } catch {
      showToast('Đã có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-6 rounded-xl bg-white p-3 shadow-card">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-semibold text-gray-700">
          Mức quỹ tháng {formatMonth(currentMonth)}: {formatCurrency(feeForMonth(fees, currentMonth))}đ
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <ul className="divide-y divide-gray-100 text-sm">
            {[...fees].reverse().map(fee => (
              <li key={fee.effective_month} className="flex items-center justify-between py-2">
                <span className="text-gray-600">Từ tháng {formatMonth(fee.effective_month)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(fee.amount)}đ</span>
                  {fees.length > 1 && (
                    <button
                      onClick={() => run(() => deleteMonthlyFee(fee.effective_month), 'Đã xóa mức quỹ')}
                      disabled={loading}
                      aria-label="Xóa mức quỹ"
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-rose-600 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-gray-500">
              Áp dụng từ tháng
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900"
              />
            </label>
            <label className="text-xs text-gray-500">
              Số tiền
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="mt-1 block w-36 rounded-lg border border-gray-300 px-3 py-2 text-right text-base text-gray-900"
              />
            </label>
            <button
              onClick={() => run(() => saveMonthlyFee({ effective_month: month, amount }), 'Đã lưu mức quỹ')}
              disabled={loading || !month || amount <= 0}
              className="h-[42px] rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Mức quỹ áp dụng từ tháng đã chọn cho đến khi có mức mới. Chuyển khoản đúng bằng mức quỹ của tháng sẽ tự ghi; số tiền khác chờ admin xử lý.
          </p>
        </div>
      )}
    </section>
  )
}
