import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, Hash } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { TransactionWithMember } from '@/lib/types/database'

interface Props {
  transactions: TransactionWithMember[]
}

export function SummaryPanel({ transactions }: Props) {
  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    })
    return { income, expense, balance: income - expense, count: transactions.length }
  }, [transactions])

  const cards = [
    { label: 'Tổng thu', value: stats.income, icon: TrendingUp, color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    { label: 'Tổng chi', value: stats.expense, icon: TrendingDown, color: 'text-rose-600', iconBg: 'bg-rose-50' },
    { label: 'Còn lại', value: stats.balance, icon: Wallet, color: 'text-primary', iconBg: 'bg-primary-50' },
    { label: 'Số giao dịch', value: stats.count, icon: Hash, color: 'text-violet-600', iconBg: 'bg-violet-50', isCount: true },
  ]

  return (
    <div className="w-full lg:sticky lg:top-6 lg:w-64 lg:self-start">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg ${card.iconBg} p-1.5`}>
                  <Icon size={14} className={card.color} />
                </div>
                <span className="text-xs font-medium text-gray-500">{card.label}</span>
              </div>
              <p className={`mt-1 text-lg font-bold ${card.color}`}>
                {card.isCount ? card.value : formatCurrency(card.value)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
