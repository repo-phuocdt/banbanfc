import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import type { TransactionWithMember } from '@/lib/types/database'

interface Props {
  transactions: TransactionWithMember[]
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
        <Link
          href="/quan-ly-quy/thu-chi"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.description || t.category}</p>
              <p className="text-xs text-gray-400">
                <DateDisplay date={t.date} />
                {t.member_name && ` — ${t.member_name}`}
              </p>
            </div>
            <div className="ml-3 flex-shrink-0">
              <CurrencyDisplay amount={t.amount} type={t.type} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
