import { formatCurrency } from '@/lib/utils/format'

interface CurrencyDisplayProps {
  amount: number
  type?: 'income' | 'expense' | 'neutral'
  className?: string
}

export function CurrencyDisplay({ amount, type = 'neutral', className = '' }: CurrencyDisplayProps) {
  const colorClass =
    type === 'income' ? 'text-income-text' :
    type === 'expense' ? 'text-expense-text' :
    ''

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {formatCurrency(amount)}
    </span>
  )
}
