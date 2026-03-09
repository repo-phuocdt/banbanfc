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
    { label: 'Tổng thu', value: formatCurrency(totalIncome), icon: TrendingUp, color: 'text-emerald-600', iconBg: 'bg-emerald-50', bg: 'bg-white' },
    { label: 'Tổng chi', value: formatCurrency(totalExpense), icon: TrendingDown, color: 'text-rose-600', iconBg: 'bg-rose-50', bg: 'bg-white' },
    { label: 'Còn lại', value: formatCurrency(balance), icon: Wallet, color: 'text-primary', iconBg: 'bg-primary-50', bg: 'bg-white' },
    { label: 'Thành viên', value: String(activeMembers), icon: Users, color: 'text-violet-600', iconBg: 'bg-violet-50', bg: 'bg-white' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div key={card.label} className={`rounded-xl ${card.bg} p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${card.iconBg} p-2`}>
                <Icon size={18} className={card.color} />
              </div>
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
