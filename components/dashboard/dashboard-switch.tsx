'use client'

import dynamic from 'next/dynamic'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { SummaryCards } from './summary-cards'
import { RecentTransactions } from './recent-transactions'
import { DashboardMobile } from '@/components/mobile/dashboard-mobile'
import { Skeleton } from '@/components/ui/skeleton'
import type { TransactionWithMember } from '@/lib/types/database'

const MonthlyChart = dynamic(
  () => import('./monthly-chart').then(m => ({ default: m.MonthlyChart })),
  { ssr: false, loading: () => <Skeleton className="h-[380px] w-full rounded-xl" /> }
)

interface DashboardSwitchProps {
  totalIncome: number
  totalExpense: number
  activeMembers: number
  monthlyData: { month: string; income: number; expense: number }[]
  recentTransactions: TransactionWithMember[]
}

export function DashboardSwitch(props: DashboardSwitchProps) {
  const isMobile = useIsMobile()

  // During SSR (isMobile === null), render desktop — LayoutShell handles mobile skeleton
  if (isMobile) {
    return <DashboardMobile {...props} />
  }

  return (
    <div className="space-y-6">
      <SummaryCards
        totalIncome={props.totalIncome}
        totalExpense={props.totalExpense}
        activeMembers={props.activeMembers}
      />
      <MonthlyChart data={props.monthlyData} />
      <RecentTransactions transactions={props.recentTransactions} />
    </div>
  )
}
