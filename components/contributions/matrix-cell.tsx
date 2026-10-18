import type { Contribution } from '@/lib/types/database'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  contribution?: Contribution
  /** Fee owed for this month. */
  fee: number
  onLeave: boolean
  beforeJoin: boolean
  clickable: boolean
  onClick: () => void
}

/** One month cell of the desktop contribution matrix. */
export function MatrixCell({ contribution, fee, onLeave, beforeJoin, clickable, onClick }: Props) {
  const hover = (cls: string) => (clickable ? cls : '')
  const style = contribution
    ? contribution.amount < fee
      ? `bg-amber-50 text-amber-700 font-medium ${hover('hover:bg-amber-100')}`
      : `bg-income-bg text-income-text font-medium ${hover('hover:bg-emerald-200')}`
    : onLeave
      ? `bg-gray-100 text-xs text-gray-500 italic ${hover('hover:bg-gray-200')}`
      : beforeJoin
        ? `bg-white ${hover('hover:bg-gray-50')}`
        : `bg-gray-50 text-gray-300 ${hover('hover:bg-gray-100')}`

  return (
    <td
      onClick={onClick}
      title={!contribution && !onLeave && beforeJoin ? 'Chưa vào đội' : undefined}
      className={`px-2 py-2 text-center transition-colors ${clickable ? 'cursor-pointer' : 'cursor-default'} ${style}`}
    >
      {contribution ? formatCurrency(contribution.amount) : onLeave ? 'Nghỉ' : beforeJoin ? '' : '—'}
    </td>
  )
}
