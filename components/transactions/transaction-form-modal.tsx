'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { createTransaction, updateTransaction } from '@/app/quan-ly-quy/thu-chi/actions'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/constants'
import { SelectField } from '@/components/ui/select-field'
import { DatePickerField } from '@/components/ui/date-picker-field'
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

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<FormValues>({
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
  const categoryOptions = categories.map(c => ({ value: c, label: c }))
  const memberOptions = members.map(m => ({ value: m.id, label: m.name }))

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
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField name="date" control={control} label="Ngày" />
          <div>
            <label className="mb-1 block text-sm font-medium">Loại *</label>
            <div className="flex overflow-hidden rounded-lg border">
              <label className={`flex-1 cursor-pointer px-3 py-2 text-center text-sm transition-colors ${watchType === 'income' ? 'bg-income-bg text-income-text font-medium' : ''}`}>
                <input type="radio" value="income" {...register('type')} className="sr-only" /> Thu
              </label>
              <label className={`flex-1 cursor-pointer px-3 py-2 text-center text-sm transition-colors ${watchType === 'expense' ? 'bg-expense-bg text-expense-text font-medium' : ''}`}>
                <input type="radio" value="expense" {...register('type')} className="sr-only" /> Chi
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Số tiền *</label>
            <input
              type="number"
              {...register('amount', { required: 'Số tiền bắt buộc', min: { value: 1, message: 'Phải > 0' }, valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
          <SelectField
            name="category"
            control={control}
            label="Danh mục"
            options={categoryOptions}
            placeholder="-- Chọn --"
            required
            error={errors.category?.message}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nội dung</label>
          <input {...register('description')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <SelectField
          name="member_id"
          control={control}
          label="Thành viên"
          options={memberOptions}
          placeholder="-- Không chọn --"
          isClearable
          isSearchable
        />
        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea {...register('note')} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </form>
    </Modal>
  )
}
