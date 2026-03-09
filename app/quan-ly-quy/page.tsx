import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { Skeleton } from '@/components/ui/skeleton'

const MonthlyChart = dynamic(
  () => import('@/components/dashboard/monthly-chart').then(m => ({ default: m.MonthlyChart })),
  { ssr: false, loading: () => <Skeleton className="h-[380px] w-full rounded-xl" /> }
)

async function DashboardContent() {
  const supabase = createClient()

  // Aggregate queries in parallel
  const [incomeRes, expenseRes, membersRes, monthlyRes, recentRes] = await Promise.all([
    supabase.from('transactions').select('amount').eq('type', 'income'),
    supabase.from('transactions').select('amount').eq('type', 'expense'),
    supabase.from('members').select('id').eq('status', 'active'),
    supabase.from('transactions').select('date, type, amount').order('date'),
    supabase.from('transactions').select('*, members(name)').order('date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(10),
  ])

  const totalIncome = (incomeRes.data || []).reduce((s, r) => s + r.amount, 0)
  const totalExpense = (expenseRes.data || []).reduce((s, r) => s + r.amount, 0)
  const activeMembers = membersRes.data?.length || 0

  // Monthly aggregates
  const monthlyMap = new Map<string, { income: number; expense: number }>()
  ;(monthlyRes.data || []).forEach(t => {
    if (!t.date) return
    const month = t.date.slice(0, 7) // YYYY-MM
    if (!monthlyMap.has(month)) monthlyMap.set(month, { income: 0, expense: 0 })
    const entry = monthlyMap.get(month)!
    if (t.type === 'income') entry.income += t.amount
    else entry.expense += t.amount
  })
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Recent transactions
  const recentTransactions = (recentRes.data || []).map((t: any) => ({
    ...t,
    member_name: t.members?.name || null,
    members: undefined,
  }))

  return (
    <div className="space-y-6">
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        activeMembers={activeMembers}
      />
      <MonthlyChart data={monthlyData} />
      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[380px] rounded-xl" />
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tổng quan</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
