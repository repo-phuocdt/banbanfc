import { Suspense } from 'react'
import { getMembers } from './actions'
import { MemberTable } from '@/components/members/member-table'
import { Skeleton } from '@/components/ui/skeleton'

function MemberTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

async function MemberTableLoader() {
  const members = await getMembers()
  return <MemberTable members={members} />
}

export default function ThanhVienPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Thành viên</h1>
      <p className="mt-1 text-sm text-gray-500">Quản lý danh sách thành viên đội bóng</p>
      <div className="mt-6">
        <Suspense fallback={<MemberTableSkeleton />}>
          <MemberTableLoader />
        </Suspense>
      </div>
    </div>
  )
}
