import { Suspense } from 'react'
import { getContributions, getActiveMembers, getLeaves } from './actions'
import { getBankInbox } from './bank-actions'
import { BankInbox } from '@/components/bank/bank-inbox'
import { ContributionSwitch } from '@/components/contributions/contribution-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'

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
  const supabase = createClient()
  const [contributions, members, leaves, { data: { user } }] = await Promise.all([
    getContributions(),
    getActiveMembers(),
    getLeaves(),
    supabase.auth.getUser(),
  ])
  const isAdmin = user?.app_metadata?.is_admin === true
  const inbox = isAdmin ? await getBankInbox() : null
  return (
    <>
      {inbox && <BankInbox pending={inbox.pending} recent={inbox.recent} members={members} />}
      <ContributionSwitch contributions={contributions} members={members} leaves={leaves} isAuthenticated={!!user} />
    </>
  )
}

export default function DongTienPage() {
  return (
    <div>
      <h1 className="hidden text-2xl font-bold md:block">Đóng tiền</h1>
      <p className="mt-1 hidden text-sm text-gray-500 md:block">Bảng đóng quỹ hàng tháng</p>
      <div className="mt-6">
        <Suspense fallback={<MatrixSkeleton />}>
          <MatrixLoader />
        </Suspense>
      </div>
    </div>
  )
}
