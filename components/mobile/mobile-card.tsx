'use client'

import { ChevronRight } from 'lucide-react'

interface MobileCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MobileCard({ children, onClick, className = '' }: MobileCardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`w-full rounded-xl bg-white p-4 shadow-card text-left transition-all active:bg-gray-50 ${
        onClick ? 'cursor-pointer hover:shadow-card-hover' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        {onClick && <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />}
      </div>
    </Component>
  )
}
