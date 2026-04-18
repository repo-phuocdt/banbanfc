'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Contribution, Member } from '@/lib/types/database'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import { PaymentModal } from '@/components/contributions/payment-modal'

interface ContributionViewProps {
  contributions: Contribution[]
  members: Member[]
  isAuthenticated?: boolean
}

export function ContributionView({ contributions, members, isAuthenticated = false }: ContributionViewProps) {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)

  // Build matrix: Map<member_id, Map<month, Contribution>>
  const matrix = useMemo(() => {
    const map = new Map<string, Map<string, Contribution>>()
    contributions.forEach(c => {
      if (!map.has(c.member_id)) map.set(c.member_id, new Map())
      map.get(c.member_id)!.set(c.month, c)
    })
    return map
  }, [contributions])

  // Generate month list
  const months = useMemo(() => {
    if (contributions.length === 0) {
      const now = new Date()
      return [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`]
    }
    const allMonths = contributions.map(c => c.month).sort()
    const earliest = allMonths[0]
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

  // Default to current month
  const activeMonth = selectedMonth || months[months.length - 1]

  // Filter active members
  const activeMembers = useMemo(() => {
    const order = { active: 0, paused: 1, inactive: 2 }
    return members
      .filter(m => m.status !== 'deleted')
      .sort((a, b) =>
        (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
        || a.name.localeCompare(b.name, 'vi')
      )
  }, [members])

  const activeMonthRef = useRef<HTMLButtonElement>(null)

  // Scroll active month pill into view on mount
  useEffect(() => {
    activeMonthRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  const handleCellClick = (member: Member) => {
    if (!isAuthenticated) return
    const contrib = matrix.get(member.id)?.get(activeMonth)
    setSelectedMember(member)
    setSelectedContribution(contrib || null)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Month selector — sticky within scrollable main */}
      <div className="sticky -top-4 z-10 -mx-4 bg-gray-50 px-4 pt-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {months.map(month => (
            <button
              key={month}
              ref={activeMonth === month ? activeMonthRef : undefined}
              onClick={() => setSelectedMonth(month)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeMonth === month
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {formatMonth(month)}
            </button>
          ))}
        </div>
      </div>

      {/* Member list for selected month */}
      <div className="space-y-1.5">
        {activeMembers.map(member => {
          const contrib = matrix.get(member.id)?.get(activeMonth)
          const isInactive = member.status === 'inactive'

          return (
            <button
              key={member.id}
              onClick={() => handleCellClick(member)}
              disabled={!isAuthenticated}
              className={`w-full rounded-xl bg-white p-3 shadow-card text-left transition-all ${
                isAuthenticated ? 'active:bg-gray-50' : ''
              } ${isInactive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    contrib ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    {contrib ? (
                      <Check size={16} className="text-emerald-600" />
                    ) : (
                      <X size={16} className="text-gray-400" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isInactive ? 'line-through' : ''}`}>
                    {member.name}
                  </span>
                </div>
                <div className="text-right">
                  {contrib ? (
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(contrib.amount)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Chưa đóng</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedContribution(null) }}
        member={selectedMember}
        month={activeMonth}
        contribution={selectedContribution}
      />
    </div>
  )
}
