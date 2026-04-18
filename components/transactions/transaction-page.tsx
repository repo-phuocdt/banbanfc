'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Member, TransactionWithMember } from '@/lib/types/database'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { TransactionTable } from './transaction-table'
import { TransactionList } from '@/components/mobile/transaction-list'
import { SummaryPanel } from './summary-panel'
import { TransactionFormModal } from './transaction-form-modal'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/constants'
import { StandaloneSelect } from '@/components/ui/select-field'
import { StandaloneDatePicker } from '@/components/ui/date-picker-field'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  transactions: TransactionWithMember[]
  members: Pick<Member, 'id' | 'name'>[]
  isAuthenticated?: boolean
}

export function TransactionPage({ transactions, members, isAuthenticated = false }: Props) {
  const isMobile = useIsMobile()
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

  // Mobile layout
  if (isMobile) {
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    return (
      <div>
        {/* Summary + filters — sticky within scrollable main */}
        <div className="sticky -top-4 z-10 -mx-4 bg-gray-50 px-4 pt-4 pb-3">
          <div className="mb-2 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">Thu</p>
              <p className="text-xs font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">Chi</p>
              <p className="text-xs font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="rounded-lg bg-primary-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">Còn lại</p>
              <p className="text-xs font-bold text-primary">{formatCurrency(totalIncome - totalExpense)}</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 overflow-x-auto">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setCategoryFilter('') }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {t === 'all' ? 'Tất cả' : t === 'income' ? 'Thu' : 'Chi'}
            </button>
          ))}
          </div>
        </div>

        <TransactionList
          transactions={displayed}
          onEdit={t => { setEditing(t); setModalOpen(true) }}
          isAuthenticated={isAuthenticated}
        />

        {/* FAB */}
        {isAuthenticated && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
            aria-label="Thêm giao dịch"
          >
            <Plus size={24} />
          </button>
        )}

        <TransactionFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          transaction={editing}
          members={members}
        />
      </div>
    )
  }

  // Desktop layout
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
