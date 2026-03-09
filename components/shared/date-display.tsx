import { formatDate } from '@/lib/utils/format'

interface DateDisplayProps {
  date: string | null
  className?: string
}

export function DateDisplay({ date, className = '' }: DateDisplayProps) {
  if (!date) return <span className={`text-gray-400 italic ${className}`}>Không rõ ngày</span>
  return <span className={className}>{formatDate(date)}</span>
}
