'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Contribution, Member } from '@/lib/types/database'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import { StandaloneSelect } from '@/components/ui/select-field'
import { PaymentModal } from './payment-modal'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã nghỉ' },
  { value: 'paused', label: 'Tạm nghỉ' },
]

interface Props {
  contributions: Contribution[]
  members: Member[]
  isAuthenticated?: boolean
}

export function ContributionMatrix({ contributions, members, isAuthenticated = false }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Persist extra months count in URL (?extra=N)
  const extraMonths = Number(searchParams.get('extra')) || 0
  const setExtraMonths = useCallback((updater: (n: number) => number) => {
    const next = updater(extraMonths)
    const params = new URLSearchParams(searchParams.toString())
    if (next > 0) params.set('extra', String(next))
    else params.delete('extra')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [extraMonths, searchParams, router, pathname])

  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)

  const matrix = useMemo(() => {
    const map = new Map<string, Map<string, Contribution>>()
    contributions.forEach(c => {
      if (!map.has(c.member_id)) map.set(c.member_id, new Map())
      map.get(c.member_id)!.set(c.month, c)
    })
    return map
  }, [contributions])

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

    // Extend with extra months added by user
    for (let i = 0; i < extraMonths; i++) {
      result.push(`${y}-${String(m).padStart(2, '0')}`)
      m++
      if (m > 12) { m = 1; y++ }
    }

    return result
  }, [contributions, extraMonths])

  // Calculate total per member for sorting
  const memberTotals = useMemo(() => {
    const totals = new Map<string, number>()
    contributions.forEach(c => totals.set(c.member_id, (totals.get(c.member_id) || 0) + c.amount))
    return totals
  }, [contributions])

  const filteredMembers = useMemo(() => {
    let list = members.filter(m => m.status !== 'deleted')
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter)
    const order = { active: 0, paused: 1, inactive: 2 }
    return list.sort((a, b) =>
      (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
      || (memberTotals.get(b.id) || 0) - (memberTotals.get(a.id) || 0)
      || a.name.localeCompare(b.name, 'vi')
    )
  }, [members, statusFilter, memberTotals])

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
      <div className="mb-4">
        <div className="w-48">
          <StandaloneSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            placeholder="Trạng thái"
          />
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 w-10">
                STT
              </th>
              <th className="sticky left-[48px] z-10 bg-gray-50 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 min-w-[140px]">
                Họ tên
              </th>
              {months.map(m => (
                <th key={m} className="px-2 py-2 text-center text-xs font-medium text-gray-500 min-w-[90px]">
                  {formatMonth(m)}
                </th>
              ))}
              {isAuthenticated && (
                <th className="px-1 py-2 min-w-[40px]">
                  <button
                    onClick={() => setExtraMonths(n => n + 1)}
                    className="mx-auto flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 transition-colors hover:border-primary hover:text-primary"
                    title="Thêm tháng tiếp theo"
                  >
                    +
                  </button>
                </th>
              )}
              <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Tổng</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Tháng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.map((member, i) => {
              const memberContribs = matrix.get(member.id)
              const total = contributions
                .filter(c => c.member_id === member.id)
                .reduce((sum, c) => sum + c.amount, 0)
              const monthCount = memberContribs?.size || 0
              const isInactive = member.status === 'inactive'

              return (
                <tr key={member.id} className={`transition-colors ${isInactive ? 'opacity-50' : ''}`}>
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-gray-500 border-r border-gray-100">
                    {i + 1}
                  </td>
                  <td className={`sticky left-[48px] z-10 bg-white px-3 py-2 font-medium border-r border-gray-100 ${isInactive ? 'line-through' : ''}`}>
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
                            ? `bg-income-bg text-income-text font-medium ${isAuthenticated ? 'hover:bg-emerald-200' : ''}`
                            : `bg-gray-50 text-gray-300 ${isAuthenticated ? 'hover:bg-gray-100' : ''}`
                        }`}
                      >
                        {contrib ? formatCurrency(contrib.amount) : '—'}
                      </td>
                    )
                  })}
                  {isAuthenticated && <td className="px-1 py-2" />}
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
