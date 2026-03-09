import { Suspense } from 'react'
import { getTransactions, getMembersForDropdown } from './actions'
import { TransactionPage } from '@/components/transactions/transaction-page'
import { Skeleton } from '@/components/ui/skeleton'

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

async function TransactionLoader() {
  const [transactions, members] = await Promise.all([
    getTransactions(),
    getMembersForDropdown(),
  ])
  return <TransactionPage transactions={transactions} members={members} />
}

export default function ThuChiPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Thu chi</h1>
      <p className="mt-1 text-sm text-gray-500">Sổ giao dịch thu chi đội bóng</p>
      <div className="mt-6">
        <Suspense fallback={<TransactionSkeleton />}>
          <TransactionLoader />
        </Suspense>
      </div>
    </div>
  )
}
