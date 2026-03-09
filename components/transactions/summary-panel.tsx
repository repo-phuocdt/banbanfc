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
    { label: 'Tổng thu', value: stats.income, icon: TrendingUp, color: 'text-income-text', bg: 'bg-income-bg' },
    { label: 'Tổng chi', value: stats.expense, icon: TrendingDown, color: 'text-expense-text', bg: 'bg-expense-bg' },
    { label: 'Còn lại', value: stats.balance, icon: Wallet, color: 'text-primary', bg: 'bg-blue-50' },
    { label: 'Số giao dịch', value: stats.count, icon: Hash, color: 'text-gray-600', bg: 'bg-gray-100', isCount: true },
  ]

  return (
    <div className="w-full lg:sticky lg:top-6 lg:w-64 lg:self-start">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`rounded-lg ${card.bg} p-4`}>
              <div className="flex items-center gap-2">
                <Icon size={16} className={card.color} />
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
