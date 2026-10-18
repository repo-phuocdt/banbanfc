import { formatCurrency } from '@/lib/utils/format'
import type { BankMonthStats, BankStatus } from '@/lib/bank/monthly-stats'

const STATUS_ROWS: { status: BankStatus; label: string }[] = [
  { status: 'applied', label: 'Đã ghi' },
  { status: 'pending', label: 'Chờ xử lý' },
  { status: 'ignored', label: 'Bỏ qua' },
]

/** Totals, status split and expense categories of one month of bank activity. */
export function BankMonthDetail({ stats }: { stats: BankMonthStats }) {
  const net = stats.in - stats.out
  const totals = [
    { label: 'Tiền vào', value: stats.in, count: stats.inCount, color: 'text-emerald-600' },
    { label: 'Tiền ra', value: stats.out, count: stats.outCount, color: 'text-rose-600' },
    { label: 'Chênh lệch', value: net, count: null, color: net >= 0 ? 'text-primary' : 'text-rose-600' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {totals.map(t => (
          <div key={t.label} className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{t.label}</p>
            <p className={`mt-1 text-base font-bold sm:text-xl ${t.color}`}>
              {t.value > 0 && t.label === 'Chênh lệch' ? '+' : ''}{formatCurrency(t.value)}
            </p>
            {t.count !== null && <p className="text-[11px] text-gray-400">{t.count} giao dịch</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Theo trạng thái</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="py-1 font-normal">Trạng thái</th>
                <th className="py-1 text-right font-normal">Vào</th>
                <th className="py-1 text-right font-normal">Ra</th>
              </tr>
            </thead>
            <tbody>
              {STATUS_ROWS.map(({ status, label }) => (
                <tr key={status} className="border-t border-gray-100">
                  <td className="py-1.5">{label}</td>
                  <td className="py-1.5 text-right text-emerald-600">{formatCurrency(stats.byStatus[status].in)}</td>
                  <td className="py-1.5 text-right text-rose-600">{formatCurrency(stats.byStatus[status].out)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Tiền ra theo danh mục</h3>
          {stats.outByCategory.length === 0 ? (
            <p className="text-sm text-gray-400">Không có khoản chi</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {stats.outByCategory.map(c => (
                <li key={c.category}>
                  <div className="flex justify-between">
                    <span>{c.category}</span>
                    <span className="text-rose-600">{formatCurrency(c.amount)}</span>
                  </div>
                  <progress
                    value={c.amount}
                    max={stats.out}
                    className="mt-0.5 block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-gray-100 [&::-moz-progress-bar]:bg-rose-400 [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-rose-400"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
