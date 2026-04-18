'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogIn, LogOut, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const PAGE_TITLES: Record<string, string> = {
  '/quan-ly-quy': 'Tổng quan',
  '/quan-ly-quy/thanh-vien': 'Thành viên',
  '/quan-ly-quy/dong-tien': 'Đóng tiền',
  '/quan-ly-quy/thu-chi': 'Thu chi',
  '/quan-ly-quy/qr-chuyen-tien': 'QR chuyển tiền',
}

interface MobileHeaderProps {
  user: User | null
}

export function MobileHeader({ user }: MobileHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const title = PAGE_TITLES[pathname] || 'Ban Ban FC'

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menuOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/banbanfc-logo.jpg"
          alt="Ban Ban FC"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-sm font-bold text-gray-900">{title}</span>
      </div>

      {/* Right: Menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-expanded={menuOpen}
          aria-label="Menu"
        >
          <MoreVertical size={20} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-[55]" onClick={() => setMenuOpen(false)} role="presentation" />
            <div className="absolute right-0 top-full z-[56] mt-1 w-40 rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogIn size={16} />
                  Đăng nhập
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
