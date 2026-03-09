'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { createTransaction, updateTransaction } from '@/app/quan-ly-quy/thu-chi/actions'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_CONTRIBUTION } from '@/lib/utils/constants'
import type { Member, TransactionWithMember } from '@/lib/types/database'

interface Props {
  open: boolean
  onClose: () => void
  transaction: TransactionWithMember | null
  members: Pick<Member, 'id' | 'name'>[]
}

interface FormValues {
  date: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  member_id: string
  note: string
}

export function TransactionFormModal({ open, onClose, transaction, members }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = !!transaction

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      member_id: '',
      note: '',
    },
  })

  const watchType = watch('type')
  const categories = watchType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  useEffect(() => {
    if (transaction) {
      reset({
        date: transaction.date ? transaction.date.split('T')[0] : '',
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        member_id: transaction.member_id || '',
        note: transaction.note || '',
      })
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        member_id: '',
        note: '',
      })
    }
  }, [transaction, reset])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        date: data.date || null,
        member_id: data.member_id || null,
        note: data.note || null,
      }
      const result = isEdit
        ? await updateTransaction(transaction!.id, payload)
        : await createTransaction(payload)

      if (result.success) {
        showToast(isEdit ? 'Đã cập nhật giao dịch' : 'Đã thêm giao dịch')
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
      open={open}
      onClose={onClose}
      title={isEdit ? 'Sửa giao dịch' : 'Thêm giao dịch'}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Ngày</label>
            <input type="date" {...register('date')} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Loại *</label>
            <div className="flex rounded-lg border">
              <label className={`flex-1 cursor-pointer px-3 py-2 text-center text-sm ${watchType === 'income' ? 'bg-income-bg text-income-text font-medium' : ''}`}>
                <input type="radio" value="income" {...register('type')} className="sr-only" /> Thu
              </label>
              <label className={`flex-1 cursor-pointer px-3 py-2 text-center text-sm ${watchType === 'expense' ? 'bg-expense-bg text-expense-text font-medium' : ''}`}>
                <input type="radio" value="expense" {...register('type')} className="sr-only" /> Chi
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Số tiền *</label>
            <input
              type="number"
              {...register('amount', { required: 'Số tiền bắt buộc', min: { value: 1, message: 'Phải > 0' }, valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Danh mục *</label>
            <select {...register('category', { required: 'Chọn danh mục' })} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nội dung</label>
          <input {...register('description')} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Thành viên</label>
          <select {...register('member_id')} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option value="">-- Không chọn --</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea {...register('note')} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
      </form>
    </Modal>
  )
}
