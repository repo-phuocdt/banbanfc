'use client'

import type { User } from '@supabase/supabase-js'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Sidebar } from './sidebar'
import { MobileLayout } from '@/components/mobile/mobile-layout'
import { Breadcrumb } from './breadcrumb'

interface LayoutShellProps {
  user: User | null
  children: React.ReactNode
}

export function LayoutShell({ user, children }: LayoutShellProps) {
  const isMobile = useIsMobile()

  // SSR: use CSS media queries for initial render to avoid flash
  if (isMobile === null) {
    return (
      <>
        {/* Desktop layout (hidden on mobile via CSS) */}
        <div className="hidden md:flex h-screen">
          <Sidebar user={user} />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-8 md:py-6">
              <div className="mb-6">
                <Breadcrumb />
              </div>
              {children}
            </div>
          </main>
        </div>
        {/* Mobile skeleton (shown on mobile via CSS) */}
        <div className="md:hidden flex h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </>
    )
  }

  if (isMobile) {
    return <MobileLayout user={user}>{children}</MobileLayout>
  }

  // Desktop
  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-8 md:py-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
