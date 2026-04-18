import { Suspense } from 'react'
import { getQrCodes } from './actions'
import { QrCodeSwitch } from '@/components/qr-codes/qr-code-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'QR chuyển tiền - Ban Ban FC',
  description: 'Quét mã QR để chuyển quỹ cho Ban Ban FC',
}

function QrSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function QrLoader() {
  const supabase = createClient()
  const [qrCodes, { data: { user } }] = await Promise.all([
    getQrCodes(),
    supabase.auth.getUser(),
  ])
  const isAdmin = user?.app_metadata?.is_admin === true
  return <QrCodeSwitch qrCodes={qrCodes} isAdmin={isAdmin} />
}

export default function QrChuyenTienPage() {
  return (
    <div>
      <h1 className="hidden text-2xl font-bold md:block">QR chuyển tiền</h1>
      <p className="mt-1 hidden text-sm text-gray-500 md:block">
        Quét mã QR bên dưới để chuyển quỹ cho đội bóng. Chỉ quản trị viên mới có thể thêm, sửa hoặc xóa mã QR.
      </p>
      <div className="mt-6">
        <Suspense fallback={<QrSkeleton />}>
          <QrLoader />
        </Suspense>
      </div>
    </div>
  )
}
