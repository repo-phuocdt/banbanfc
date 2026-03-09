import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants'

interface BadgeProps {
  status: string
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  const label = STATUS_LABELS[status] || status

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
