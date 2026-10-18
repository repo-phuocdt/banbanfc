'use client'

import { useState } from 'react'
import type { BankTransactionWithMembers } from '@/app/quan-ly-quy/dong-tien/bank-actions'
import type { BankTransaction, Member } from '@/lib/types/database'
import { AssignMemberModal } from './assign-member-modal'
import { PendingBankItem } from './pending-bank-item'
import { RecentBankItem } from './recent-bank-item'

interface Props {
  pending: BankTransaction[]
  recent: BankTransactionWithMembers[]
  members: Pick<Member, 'id' | 'name' | 'status'>[]
}

// Admin-only and small, so one responsive component serves both desktop and mobile.
export function BankInbox({ pending, recent, members }: Props) {
  const [tab, setTab] = useState<'pending' | 'recent'>(pending.length > 0 ? 'pending' : 'recent')
  const [assigning, setAssigning] = useState<BankTransaction | null>(null)

  // Keeps a long queue from pushing the contribution grid far down the page.
  const listClass = 'grid max-h-[60vh] gap-2 overflow-y-auto overscroll-contain pr-1 md:max-h-[420px] md:grid-cols-2'

  const tabClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
    }`

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="mr-2 text-sm font-semibold text-gray-700">Giao dịch ngân hàng</h2>
        <button onClick={() => setTab('pending')} className={tabClass(tab === 'pending')}>
          Chờ xử lý{pending.length > 0 ? ` (${pending.length})` : ''}
        </button>
        <button onClick={() => setTab('recent')} className={tabClass(tab === 'recent')}>
          Đã ghi gần đây
        </button>
      </div>

      {tab === 'pending' ? (
        pending.length === 0 ? (
          <p className="text-sm text-gray-500">Không có giao dịch nào cần xử lý.</p>
        ) : (
          <div className={listClass}>
            {pending.map(tx => <PendingBankItem key={tx.id} tx={tx} onAssign={setAssigning} />)}
          </div>
        )
      ) : recent.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có giao dịch nào được ghi.</p>
      ) : (
        <div className={listClass}>
          {recent.map(tx => <RecentBankItem key={tx.id} tx={tx} />)}
        </div>
      )}

      <AssignMemberModal tx={assigning} members={members} onClose={() => setAssigning(null)} />
    </section>
  )
}
