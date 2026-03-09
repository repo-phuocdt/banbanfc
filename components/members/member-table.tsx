'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import type { MemberWithTotal } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { DateDisplay } from '@/components/shared/date-display'
import { MemberFormModal } from './member-form-modal'
import { deleteMember, updateMemberStatus } from '@/app/quan-ly-quy/thanh-vien/actions'
import { useToast } from '@/components/ui/toast'

interface MemberTableProps {
  members: MemberWithTotal[]
  isAuthenticated?: boolean
}

export function MemberTable({ members, isAuthenticated = false }: MemberTableProps) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MemberWithTotal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MemberWithTotal | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || m.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [members, search, statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteMember(deleteTarget.id)
      if (result.success) {
        showToast('Đã xóa thành viên')
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const result = await updateMemberStatus(id, status)
      if (result.success) {
        showToast('Đã cập nhật trạng thái')
      } else {
        showToast(result.error, 'error')
      }
    } catch {
      showToast('Lỗi khi cập nhật', 'error')
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã nghỉ</option>
            <option value="paused">Tạm nghỉ</option>
          </select>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Thêm thành viên
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="Không có thành viên" description="Chưa có thành viên nào phù hợp" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 w-12">STT</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                <th className="px-4 py-3 text-right">Tổng đã đóng</th>
                <th className="px-4 py-3">Ghi chú</th>
                {isAuthenticated && <th className="px-4 py-3 w-32"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((member, i) => {
                const isInactive = member.status === 'inactive'
                return (
                  <tr key={member.id} className={`${i % 2 === 1 ? 'bg-gray-50/50' : ''} ${isInactive ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className={`px-4 py-3 font-medium ${isInactive ? 'line-through' : ''}`}>
                      {member.name}
                    </td>
                    <td className="px-4 py-3">
                      {isAuthenticated ? (
                        <select
                          value={member.status}
                          onChange={e => handleStatusChange(member.id, e.target.value)}
                          className="rounded border bg-transparent px-1 py-0.5 text-xs"
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Đã nghỉ</option>
                          <option value="paused">Tạm nghỉ</option>
                        </select>
                      ) : (
                        <Badge status={member.status} />
                      )}
                    </td>
                    <td className="px-4 py-3"><DateDisplay date={member.joined_at} /></td>
                    <td className="px-4 py-3 text-right">
                      <CurrencyDisplay amount={member.total_contributed} type="income" />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{member.note || '—'}</td>
                    {isAuthenticated && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditing(member); setModalOpen(true) }}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Sửa"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <MemberFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        member={editing}
      />

      {/* Delete Confirm */}
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
