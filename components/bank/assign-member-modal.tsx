'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { StandaloneSelect } from '@/components/ui/select-field'
import { useToast } from '@/components/ui/toast'
import { assignBankTransaction } from '@/app/quan-ly-quy/dong-tien/bank-actions'
import { extractSenderName } from '@/lib/bank/normalize'
import { formatCurrency } from '@/lib/utils/format'
import type { BankTransaction, Member } from '@/lib/types/database'

interface Props {
  tx: BankTransaction | null
  members: Pick<Member, 'id' | 'name' | 'status'>[]
  onClose: () => void
}

interface Part {
  memberId: string
  amount: number
}

export function AssignMemberModal({ tx, members, onClose }: Props) {
  const { showToast } = useToast()
  const [parts, setParts] = useState<Part[]>([])
  const [rememberName, setRememberName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tx) return
    setParts([{ memberId: '', amount: tx.amount }])
    setRememberName(extractSenderName(tx.content) ?? '')
  }, [tx])

  const options = members
    .filter(m => m.status !== 'deleted')
    .map(m => ({ value: m.id, label: m.status === 'inactive' ? `${m.name} (đã nghỉ)` : m.name }))
  const total = parts.reduce((sum, p) => sum + (p.amount || 0), 0)
  const update = (i: number, patch: Partial<Part>) =>
    setParts(prev => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))

  const handleSubmit = async () => {
    if (!tx) return
    setLoading(true)
    try {
      const result = await assignBankTransaction({
        bank_transaction_id: tx.id,
        parts: parts.map(p => ({ member_id: p.memberId, amount: p.amount })),
        remember_name: parts.length === 1 ? rememberName : null,
      })
      if (result.success) {
        showToast('Đã ghi nhận chuyển khoản')
        onClose()
      } else {
        showToast(result.error, 'error')
      }
    } catch {
      showToast('Đã có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={!!tx}
      onClose={onClose}
      size="lg"
      title={`Gán thành viên — ${formatCurrency(tx?.amount ?? 0)}đ`}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || total !== tx?.amount || parts.some(p => !p.memberId)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Ghi nhận'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Nội dung chuyển khoản</p>
          <p className="mt-0.5 break-words text-sm font-medium text-gray-800">{tx?.content}</p>
        </div>
        {parts.map((part, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1">
              <StandaloneSelect
                value={part.memberId}
                onChange={v => update(i, { memberId: v })}
                options={options}
                placeholder="Chọn thành viên"
                isSearchable
              />
            </div>
            <input
              type="number"
              value={part.amount}
              onChange={e => update(i, { amount: Number(e.target.value) })}
              aria-label="Số tiền"
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-right text-base sm:w-40"
            />
            {parts.length > 1 && (
              <button onClick={() => setParts(prev => prev.filter((_, idx) => idx !== i))} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => setParts(prev => [...prev, { memberId: '', amount: Math.max((tx?.amount ?? 0) - total, 0) }])}
            className="flex items-center gap-1 font-medium text-primary"
          >
            <Plus size={16} /> Chia cho thêm người
          </button>
          <span className={total === tx?.amount ? 'text-gray-500' : 'text-rose-600'}>
            Tổng {formatCurrency(total)}đ / {formatCurrency(tx?.amount ?? 0)}đ
          </span>
        </div>
        {parts.length === 1 && (
          <div>
            <label className="mb-1 block text-sm font-medium">Ghi nhớ tên chuyển tiền</label>
            <input
              value={rememberName}
              onChange={e => setRememberName(e.target.value)}
              placeholder="Để trống nếu không muốn ghi nhớ"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
            />
            <p className="mt-1 text-xs text-gray-500">Lần sau chuyển khoản có tên này sẽ tự ghi cho thành viên đã chọn.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
