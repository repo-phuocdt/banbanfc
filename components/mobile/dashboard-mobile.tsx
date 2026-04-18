'use client'

import dynamic from 'next/dynamic'
import { TrendingUp, TrendingDown, Wallet, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import { Skeleton } from '@/components/ui/skeleton'
import type { TransactionWithMember } from '@/lib/types/database'

const MonthlyChart = dynamic(
  () => import('@/components/dashboard/monthly-chart').then(m => ({ default: m.MonthlyChart })),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full rounded-xl" /> }
)

interface DashboardMobileProps {
  totalIncome: number
  totalExpense: number
  activeMembers: number
  monthlyData: { month: string; income: number; expense: number }[]
  recentTransactions: TransactionWithMember[]
}

export function DashboardMobile({
  totalIncome,
  totalExpense,
  activeMembers,
  monthlyData,
  recentTransactions,
}: DashboardMobileProps) {
  const balance = totalIncome - totalExpense

  const cards = [
    { label: 'Tổng thu', value: formatCurrency(totalIncome), icon: TrendingUp, color: 'text-emerald-600', border: 'border-emerald-400' },
    { label: 'Tổng chi', value: formatCurrency(totalExpense), icon: TrendingDown, color: 'text-rose-600', border: 'border-rose-400' },
    { label: 'Còn lại', value: formatCurrency(balance), icon: Wallet, color: 'text-primary', border: 'border-primary' },
    { label: 'Thành viên', value: String(activeMembers), icon: Users, color: 'text-violet-600', border: 'border-violet-400' },
  ]

  return (
    <div className="space-y-4">
      {/* Summary Cards — 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`rounded-xl bg-white p-3 shadow-card border-l-4 ${card.border}`}>
              <div className="flex items-center gap-2">
                <Icon size={14} className={card.color} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <p className={`mt-1.5 text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Monthly Chart — MonthlyChart has its own card wrapper */}
      <MonthlyChart data={monthlyData} />

      {/* Recent Transactions */}
      <div className="rounded-xl bg-white p-3 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Giao dịch gần đây</h2>
          <Link
            href="/quan-ly-quy/thu-chi"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Xem tất cả <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.description || t.category}</p>
                <p className="text-[11px] text-gray-400">
                  <DateDisplay date={t.date} />
                  {t.member_name && ` · ${t.member_name}`}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <CurrencyDisplay amount={t.amount} type={t.type} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
