import { Suspense } from 'react'
import { getContributions, getActiveMembers } from './actions'
import { ContributionMatrix } from '@/components/contributions/contribution-matrix'
import { Skeleton } from '@/components/ui/skeleton'

function MatrixSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

async function MatrixLoader() {
  const [contributions, members] = await Promise.all([
    getContributions(),
    getActiveMembers(),
  ])
  return <ContributionMatrix contributions={contributions} members={members} />
}

export default function DongTienPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Đóng tiền</h1>
      <p className="mt-1 text-sm text-gray-500">Bảng đóng quỹ hàng tháng</p>
      <div className="mt-6">
        <Suspense fallback={<MatrixSkeleton />}>
          <MatrixLoader />
        </Suspense>
      </div>
    </div>
  )
}
