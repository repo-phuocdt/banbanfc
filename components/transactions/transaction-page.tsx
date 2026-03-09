'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { Member, TransactionWithMember } from '@/lib/types/database'
import { TransactionTable } from './transaction-table'
import { SummaryPanel } from './summary-panel'
import { TransactionFormModal } from './transaction-form-modal'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/constants'

interface Props {
  transactions: TransactionWithMember[]
  members: Pick<Member, 'id' | 'name'>[]
}

export function TransactionPage({ transactions, members }: Props) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionWithMember | null>(null)

  // Running balance on ALL data (unfiltered), sorted by date ASC
  const transactionsWithBalance = useMemo(() => {
    let balance = 0
    return transactions.map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount
      return { ...t, running_balance: balance }
    })
  }, [transactions])

  // Filter for display
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

  // Display in DESC order
  const displayed = useMemo(() => [...filtered].reverse(), [filtered])

  const categories = typeFilter === 'income'
    ? INCOME_CATEGORIES
    : typeFilter === 'expense'
    ? EXPENSE_CATEGORIES
    : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Đến ngày"
            />
            <select
              value={memberFilter}
              onChange={e => setMemberFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Tất cả thành viên</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setCategoryFilter('') }}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    typeFilter === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'all' ? 'Tất cả' : t === 'income' ? 'Thu' : 'Chi'}
                </button>
              ))}
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => { setEditing(null); setModalOpen(true) }}
              className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Thêm giao dịch
            </button>
          </div>
        </div>

        <TransactionTable
          transactions={displayed}
          onEdit={t => { setEditing(t); setModalOpen(true) }}
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
