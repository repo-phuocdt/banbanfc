import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  totalIncome: number
  totalExpense: number
  activeMembers: number
}

export function SummaryCards({ totalIncome, totalExpense, activeMembers }: Props) {
  const balance = totalIncome - totalExpense
  const cards = [
    { label: 'Tổng thu', value: formatCurrency(totalIncome), icon: TrendingUp, color: 'text-income-text', bg: 'bg-income-bg' },
    { label: 'Tổng chi', value: formatCurrency(totalExpense), icon: TrendingDown, color: 'text-expense-text', bg: 'bg-expense-bg' },
    { label: 'Còn lại', value: formatCurrency(balance), icon: Wallet, color: 'text-primary', bg: 'bg-blue-50' },
    { label: 'Thành viên', value: String(activeMembers), icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div key={card.label} className={`rounded-xl ${card.bg} p-5`}>
            <div className="flex items-center gap-2">
              <Icon size={18} className={card.color} />
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
