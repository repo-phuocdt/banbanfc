import { ToastProvider } from '@/components/ui/toast'
import { LayoutShell } from '@/components/layout/layout-shell'
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
      <LayoutShell user={user}>
        {children}
      </LayoutShell>
    </ToastProvider>
  )
}
