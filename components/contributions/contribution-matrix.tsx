'use client'

import { useMemo, useState } from 'react'
import type { Contribution, Member } from '@/lib/types/database'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import { PaymentModal } from './payment-modal'

interface Props {
  contributions: Contribution[]
  members: Member[]
  isAuthenticated?: boolean
}

export function ContributionMatrix({ contributions, members, isAuthenticated = false }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)

  // Build matrix map: memberId -> month -> contribution
  const matrix = useMemo(() => {
    const map = new Map<string, Map<string, Contribution>>()
    contributions.forEach(c => {
      if (!map.has(c.member_id)) map.set(c.member_id, new Map())
      map.get(c.member_id)!.set(c.month, c)
    })
    return map
  }, [contributions])

  // Generate months from earliest data to current month
  const months = useMemo(() => {
    if (contributions.length === 0) {
      const now = new Date()
      return [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`]
    }
    const allMonths = contributions.map(c => c.month)
    const earliest = allMonths.sort()[0]
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const end = currentMonth > allMonths[allMonths.length - 1] ? currentMonth : allMonths[allMonths.length - 1]

    const result: string[] = []
    const [startY, startM] = earliest.split('-').map(Number)
    const [endY, endM] = end.split('-').map(Number)
    let y = startY, m = startM
    while (y < endY || (y === endY && m <= endM)) {
      result.push(`${y}-${String(m).padStart(2, '0')}`)
      m++
      if (m > 12) { m = 1; y++ }
    }
    return result
  }, [contributions])

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let list = members.filter(m => m.status !== 'deleted')
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter)
    // Sort: active first, then paused, then inactive
    const order = { active: 0, paused: 1, inactive: 2 }
    return list.sort((a, b) =>
      (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
      || a.name.localeCompare(b.name, 'vi')
    )
  }, [members, statusFilter])

  const handleCellClick = (member: Member, month: string) => {
    if (!isAuthenticated) return
    const contrib = matrix.get(member.id)?.get(month)
    setSelectedMember(member)
    setSelectedMonth(month)
    setSelectedContribution(contrib || null)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã nghỉ</option>
          <option value="paused">Tạm nghỉ</option>
        </select>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 w-10">
                STT
              </th>
              <th className="sticky left-[48px] z-10 bg-gray-50 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 min-w-[160px]">
                Họ tên
              </th>
              {months.map(m => (
                <th key={m} className="px-2 py-2 text-center text-xs font-medium text-gray-500 min-w-[90px]">
                  {formatMonth(m)}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Tổng</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Tháng</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.map((member, i) => {
              const memberContribs = matrix.get(member.id)
              const total = contributions
                .filter(c => c.member_id === member.id)
                .reduce((sum, c) => sum + c.amount, 0)
              const monthCount = memberContribs?.size || 0
              const isInactive = member.status === 'inactive'

              return (
                <tr key={member.id} className={isInactive ? 'opacity-50' : ''}>
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-gray-500 border-r">
                    {i + 1}
                  </td>
                  <td className={`sticky left-[48px] z-10 bg-white px-3 py-2 font-medium border-r ${isInactive ? 'line-through' : ''}`}>
                    {member.name}
                  </td>
                  {months.map(month => {
                    const contrib = memberContribs?.get(month)
                    return (
                      <td
                        key={month}
                        onClick={() => handleCellClick(member, month)}
                        className={`px-2 py-2 text-center transition-colors ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'} ${
                          contrib
                            ? `bg-income-bg text-income-text font-medium ${isAuthenticated ? 'hover:bg-green-200' : ''}`
                            : `bg-gray-50 text-gray-300 ${isAuthenticated ? 'hover:bg-gray-100' : ''}`
                        }`}
                      >
                        {contrib ? formatCurrency(contrib.amount) : '—'}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-right font-bold text-income-text">
                    {formatCurrency(total)}
                  </td>
                  <td className="px-3 py-2 text-center font-medium">
                    {monthCount}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedContribution(null) }}
        member={selectedMember}
        month={selectedMonth}
        contribution={selectedContribution}
      />
    </div>
  )
}
