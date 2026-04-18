'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, Wallet, Receipt, QrCode } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/quan-ly-quy', label: 'Tổng quan', icon: BarChart3 },
  { href: '/quan-ly-quy/thanh-vien', label: 'Thành viên', icon: Users },
  { href: '/quan-ly-quy/dong-tien', label: 'Đóng tiền', icon: Wallet },
  { href: '/quan-ly-quy/thu-chi', label: 'Thu chi', icon: Receipt },
  { href: '/quan-ly-quy/qr-chuyen-tien', label: 'QR', icon: QrCode },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/quan-ly-quy') return pathname === '/quan-ly-quy'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
