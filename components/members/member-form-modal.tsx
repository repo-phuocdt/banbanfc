'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { SelectField } from '@/components/ui/select-field'
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã nghỉ' },
  { value: 'paused', label: 'Tạm nghỉ' },
]

export function MemberFormModal({ open, onClose, member }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = !!member

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
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
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <SelectField
          name="status"
          control={control}
          label="Trạng thái"
          options={STATUS_OPTIONS}
        />
        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea
            {...register('note')}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>
    </Modal>
  )
}
