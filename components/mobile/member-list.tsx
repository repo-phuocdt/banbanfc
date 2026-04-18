'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { MemberWithTotal } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { MemberFormModal } from '@/components/members/member-form-modal'
import { MemberDetailSheet } from './member-detail-sheet'
import { deleteMember } from '@/app/quan-ly-quy/thanh-vien/actions'
import { useToast } from '@/components/ui/toast'

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Đã nghỉ' },
  { value: 'paused', label: 'Tạm nghỉ' },
]

interface MemberListProps {
  members: MemberWithTotal[]
  isAuthenticated?: boolean
}

export function MemberList({ members, isAuthenticated = false }: MemberListProps) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MemberWithTotal | null>(null)
  const [detailMember, setDetailMember] = useState<MemberWithTotal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MemberWithTotal | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const order = { active: 0, paused: 1, inactive: 2 }
    return members
      .filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || m.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) =>
        (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
        || a.name.localeCompare(b.name, 'vi')
      )
  }, [members, search, statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteMember(deleteTarget.id)
      if (result.success) {
        showToast('Đã xóa thành viên')
        setDetailMember(null)
      } else {
        showToast(result.error, 'error')
      }
    } catch {
      showToast('Lỗi khi xóa', 'error')
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Search + filters — sticky within scrollable main */}
      <div className="sticky -top-4 z-10 -mx-4 bg-gray-50 px-4 pb-3 pt-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status filter pills */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member cards */}
      {filtered.length === 0 ? (
        <EmptyState title="Không có thành viên" description="Chưa có thành viên nào phù hợp" />
      ) : (
        <div className="space-y-2">
          {filtered.map(member => {
            const isInactive = member.status === 'inactive'
            return (
              <button
                key={member.id}
                onClick={() => setDetailMember(member)}
                className={`w-full rounded-xl bg-white p-3.5 shadow-card text-left transition-all active:bg-gray-50 ${
                  isInactive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isInactive ? 'line-through' : ''}`}>
                        {member.name}
                      </span>
                      <Badge status={member.status} />
                    </div>
                  </div>
                  <CurrencyDisplay amount={member.total_contributed} type="income" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Detail sheet */}
      <MemberDetailSheet
        member={detailMember}
        isAuthenticated={isAuthenticated}
        onClose={() => setDetailMember(null)}
        onEdit={m => {
          setDetailMember(null)
          setEditing(m)
          setModalOpen(true)
        }}
        onDelete={m => setDeleteTarget(m)}
      />

      {/* FAB */}
      {isAuthenticated && (
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
          aria-label="Thêm thành viên"
        >
          <Plus size={24} />
        </button>
      )}

      <MemberFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        member={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa thành viên"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Thành viên sẽ bị ẩn khỏi danh sách nhưng lịch sử đóng tiền vẫn được giữ lại.`}
        danger
        loading={loading}
      />
    </div>
  )
}
