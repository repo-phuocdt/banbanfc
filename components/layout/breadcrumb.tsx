'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const LABELS: Record<string, string> = {
  'quan-ly-quy': 'Ban Ban FC',
  'thanh-vien': 'Thành viên',
  'dong-tien': 'Đóng tiền',
  'thu-chi': 'Thu chi',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const label = LABELS[segment] || segment
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} />}
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link href={href} className="hover:text-primary">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
