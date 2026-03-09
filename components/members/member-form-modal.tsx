'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { createMember, updateMember } from '@/app/quan-ly-quy/thanh-vien/actions'
import type { MemberWithTotal } from '@/lib/types/database'

interface Props {
  open: boolean
  onClose: () => void
  member: MemberWithTotal | null
}

interface FormValues {
  name: string
  status: 'active' | 'inactive' | 'paused'
  note: string
}

export function MemberFormModal({ open, onClose, member }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = !!member

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', status: 'active', note: '' },
  })

  useEffect(() => {
    if (member) {
      reset({ name: member.name, status: member.status as FormValues['status'], note: member.note || '' })
    } else {
      reset({ name: '', status: 'active', note: '' })
    }
  }, [member, reset])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = { ...data, note: data.note || null }
      const result = isEdit
        ? await updateMember(member!.id, payload)
        : await createMember(payload)

      if (result.success) {
        showToast(isEdit ? 'Đã cập nhật thành viên' : 'Đã thêm thành viên')
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
      title={isEdit ? 'Sửa thành viên' : 'Thêm thành viên'}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
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
        <div>
          <label className="mb-1 block text-sm font-medium">Họ tên *</label>
          <input
            {...register('name', { required: 'Tên không được để trống' })}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Trạng thái</label>
          <select
            {...register('status')}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã nghỉ</option>
            <option value="paused">Tạm nghỉ</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea
            {...register('note')}
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>
    </Modal>
  )
}
