import { Sidebar } from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ToastProvider } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/server'

export default async function QuanLyQuyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ToastProvider>
      <div className="flex h-screen">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
            <div className="mb-6">
              <Breadcrumb />
            </div>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
