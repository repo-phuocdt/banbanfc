'use client'

import type { User } from '@supabase/supabase-js'
import { MobileHeader } from './mobile-header'
import { BottomNav } from './bottom-nav'

interface MobileLayoutProps {
  user: User | null
  children: React.ReactNode
}

export function MobileLayout({ user, children }: MobileLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <MobileHeader user={user} />
      <main className="flex-1 overflow-auto px-4 py-4 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
