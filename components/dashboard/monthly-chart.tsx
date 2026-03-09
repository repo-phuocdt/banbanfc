'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency, formatMonthShort } from '@/lib/utils/format'

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface Props {
  data: MonthlyData[]
}

export function MonthlyChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    name: formatMonthShort(d.month),
  }))

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Thu chi theo tháng</h2>
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis
              fontSize={12}
              tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
              width={50}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === 'income' ? 'Thu' : 'Chi',
              ]}
            />
            <Legend formatter={v => (v === 'income' ? 'Thu' : 'Chi')} />
            <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#E11D48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
