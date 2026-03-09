'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Users, Wallet, Receipt, LogIn, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/quan-ly-quy', label: 'Tổng quan', icon: BarChart3 },
  { href: '/quan-ly-quy/thanh-vien', label: 'Thành viên', icon: Users },
  { href: '/quan-ly-quy/dong-tien', label: 'Đóng tiền', icon: Wallet },
  { href: '/quan-ly-quy/thu-chi', label: 'Thu chi', icon: Receipt },
]

interface SidebarProps {
  user: User | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/quan-ly-quy') return pathname === '/quan-ly-quy'
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <span className="text-2xl">⚽</span>
        <span className="text-lg font-bold text-primary">Quỹ Đội Bóng</span>
      </div>
      <nav className="flex-1 px-2 py-4">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-4 py-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <LogIn size={18} />
            Đăng nhập
          </Link>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-2 rounded p-1 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-col border-r bg-white md:flex">
        {navContent}
      </aside>
    </>
  )
}
