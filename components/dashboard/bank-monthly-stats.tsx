'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Landmark } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMonth } from '@/lib/utils/format'
import type { BankMonthStats } from '@/lib/bank/monthly-stats'
import { BankMonthDetail } from './bank-month-detail'

const MonthlyChart = dynamic(
  () => import('./monthly-chart').then(m => ({ default: m.MonthlyChart })),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> }
)

/** Admin-only: money in/out of the fund's bank account (SePay) per month. */
export function BankMonthlyStats({ stats }: { stats: BankMonthStats[] }) {
  const [month, setMonth] = useState(stats[stats.length - 1]?.month)
  const selected = stats.find(s => s.month === month)
  if (!selected) return null

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl bg-white p-3 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold sm:text-lg">
            <Landmark size={18} className="text-primary" /> Ngân hàng theo tháng
          </h2>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            aria-label="Chọn tháng"
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          >
            {[...stats].reverse().map(s => (
              <option key={s.month} value={s.month}>{formatMonth(s.month)}</option>
            ))}
          </select>
        </div>
        <BankMonthDetail stats={selected} />
      </div>
      <MonthlyChart
        data={stats.map(s => ({ month: s.month, income: s.in, expense: s.out }))}
        title="Ngân hàng: vào / ra 12 tháng"
        incomeLabel="Vào"
        expenseLabel="Ra"
      />
    </div>
  )
}
