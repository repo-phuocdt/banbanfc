'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { createContribution, updateContribution, deleteContribution } from '@/app/quan-ly-quy/dong-tien/actions'
import { DEFAULT_CONTRIBUTION } from '@/lib/utils/constants'
import type { Contribution, Member } from '@/lib/types/database'

interface Props {
  open: boolean
  onClose: () => void
  member: Member | null
  month: string
  contribution: Contribution | null
}

interface FormValues {
  amount: number
  note: string
}

export function PaymentModal({ open, onClose, member, month, contribution }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!contribution

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { amount: DEFAULT_CONTRIBUTION, note: '' },
  })

  useEffect(() => {
    if (contribution) {
      reset({ amount: contribution.amount, note: contribution.note || '' })
    } else {
      reset({ amount: DEFAULT_CONTRIBUTION, note: '' })
    }
  }, [contribution, reset])

  const onSubmit = async (data: FormValues) => {
    if (!member) return
    setLoading(true)
    try {
      const payload = {
        member_id: member.id,
        month,
        amount: Number(data.amount),
        note: data.note || null,
      }
      const result = isEdit
        ? await updateContribution(contribution!.id, payload)
        : await createContribution(payload)

      if (result.success) {
        showToast(isEdit ? 'Đã cập nhật' : 'Đã ghi nhận đóng tiền')
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

  const handleDelete = async () => {
    if (!contribution) return
    setLoading(true)
    try {
      const result = await deleteContribution(contribution.id)
      if (result.success) {
        showToast('Đã xóa khoản đóng')
        onClose()
      } else {
        showToast(result.error, 'error')
      }
    } catch {
      showToast('Lỗi khi xóa', 'error')
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? `Sửa đóng tiền — ${member?.name}` : `Ghi nhận đóng tiền — ${member?.name}`}
        footer={
          <div className="flex w-full justify-between">
            <div>
              {isEdit && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Xóa
                </button>
              )}
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tháng</label>
            <input
              type="text"
              value={month}
              disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Số tiền</label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <textarea
              {...register('note')}
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa khoản đóng"
        message="Bạn có chắc muốn xóa khoản đóng này? Giao dịch thu liên kết cũng sẽ bị xóa."
        danger
        loading={loading}
      />
    </>
  )
}
