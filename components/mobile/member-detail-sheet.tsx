'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { MemberWithTotal } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import { MobileSheet } from './mobile-sheet'

interface MemberDetailSheetProps {
  member: MemberWithTotal | null
  isAuthenticated: boolean
  onClose: () => void
  onEdit: (member: MemberWithTotal) => void
  onDelete: (member: MemberWithTotal) => void
}

export function MemberDetailSheet({ member, isAuthenticated, onClose, onEdit, onDelete }: MemberDetailSheetProps) {
  return (
    <MobileSheet open={!!member} onClose={onClose} title={member?.name || ''}>
      {member && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge status={member.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Tổng đã đóng</p>
              <p className="text-sm font-semibold">
                <CurrencyDisplay amount={member.total_contributed} type="income" />
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ngày tham gia</p>
              <p className="text-sm font-medium">
                <DateDisplay date={member.joined_at} />
              </p>
            </div>
          </div>

          {member.note && (
            <div>
              <p className="text-xs text-gray-500">Ghi chú</p>
              <p className="mt-0.5 text-sm text-gray-700">{member.note}</p>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(member)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Pencil size={14} />
                Sửa
              </button>
              <button
                onClick={() => onDelete(member)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          )}
        </div>
      )}
    </MobileSheet>
  )
}
