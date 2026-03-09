'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Member, TransactionWithMember } from '@/lib/types/database'
import { TransactionTable } from './transaction-table'
import { SummaryPanel } from './summary-panel'
import { TransactionFormModal } from './transaction-form-modal'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/constants'
import { StandaloneSelect } from '@/components/ui/select-field'
import { StandaloneDatePicker } from '@/components/ui/date-picker-field'

interface Props {
  transactions: TransactionWithMember[]
  members: Pick<Member, 'id' | 'name'>[]
  isAuthenticated?: boolean
}

export function TransactionPage({ transactions, members, isAuthenticated = false }: Props) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionWithMember | null>(null)

  const memberOptions = useMemo(() =>
    members.map(m => ({ value: m.id, label: m.name })), [members])

  const transactionsWithBalance = useMemo(() => {
    let balance = 0
    return transactions.map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount
      return { ...t, running_balance: balance }
    })
  }, [transactions])

  const filtered = useMemo(() => {
    return transactionsWithBalance.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (memberFilter && t.member_id !== memberFilter) return false
      if (categoryFilter && t.category !== categoryFilter) return false
      if (dateFrom && t.date && t.date < dateFrom) return false
      if (dateTo && t.date && t.date > dateTo + 'T23:59:59') return false
      return true
    })
  }, [transactionsWithBalance, dateFrom, dateTo, memberFilter, typeFilter, categoryFilter])

  const displayed = useMemo(() => [...filtered].reverse(), [filtered])

  const categories = typeFilter === 'income'
    ? INCOME_CATEGORIES
    : typeFilter === 'expense'
    ? EXPENSE_CATEGORIES
    : Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]))

  const categoryOptions = categories.map(c => ({ value: c, label: c }))

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <div className="w-36">
              <StandaloneDatePicker value={dateFrom} onChange={setDateFrom} placeholder="Từ ngày" />
            </div>
            <div className="w-36">
              <StandaloneDatePicker value={dateTo} onChange={setDateTo} placeholder="Đến ngày" />
            </div>
            <div className="w-48">
              <StandaloneSelect
                value={memberFilter}
                onChange={setMemberFilter}
                options={memberOptions}
                placeholder="Tất cả thành viên"
                isClearable
                isSearchable
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setCategoryFilter('') }}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    typeFilter === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'all' ? 'Tất cả' : t === 'income' ? 'Thu' : 'Chi'}
                </button>
              ))}
            </div>
            <div className="w-44">
              <StandaloneSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryOptions}
                placeholder="Tất cả danh mục"
                isClearable
              />
            </div>
            {isAuthenticated && (
              <button
                onClick={() => { setEditing(null); setModalOpen(true) }}
                className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <Plus size={16} />
                Thêm giao dịch
              </button>
            )}
          </div>
        </div>

        <TransactionTable
          transactions={displayed}
          onEdit={t => { setEditing(t); setModalOpen(true) }}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <SummaryPanel transactions={filtered} />

      <TransactionFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        transaction={editing}
        members={members}
      />
    </div>
  )
}
