'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { SelectField } from '@/components/ui/select-field'
import { createMember, updateMember } from '@/app/quan-ly-quy/thanh-vien/actions'
import { getMemberIdentities, saveMemberIdentities } from '@/app/quan-ly-quy/thanh-vien/identity-actions'
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
  bankNames: string
  bankAccounts: string
}

const toLines = (text: string) => text.split('\n').map(l => l.trim()).filter(Boolean)
const EMPTY: FormValues = { name: '', status: 'active', note: '', bankNames: '', bankAccounts: '' }

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã nghỉ' },
  { value: 'paused', label: 'Tạm nghỉ' },
]

export function MemberFormModal({ open, onClose, member }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  // Identities are replaced on save, so only save them once the current ones were loaded.
  const [identities, setIdentities] = useState<'loading' | 'ready' | 'failed'>('ready')
  const isEdit = !!member

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (!member) {
      reset(EMPTY)
      setIdentities('ready')
      return
    }
    const base = { ...EMPTY, name: member.name, status: member.status as FormValues['status'], note: member.note || '' }
    reset(base)
    if (!open) return
    let cancelled = false
    setIdentities('loading')
    getMemberIdentities(member.id)
      .then(ids => {
        if (cancelled) return
        if (!ids) return setIdentities('failed')
        reset({ ...base, bankNames: ids.names.join('\n'), bankAccounts: ids.accounts.join('\n') })
        setIdentities('ready')
      })
      .catch(() => { if (!cancelled) setIdentities('failed') })
    return () => { cancelled = true }
  }, [member, open, reset])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = { name: data.name, status: data.status, note: data.note || null }
      const result = isEdit
        ? await updateMember(member!.id, payload)
        : await createMember(payload)
      const memberId = isEdit ? member!.id : result.success ? result.data?.id : undefined
      const saved = memberId && identities === 'ready'
        ? await saveMemberIdentities(memberId, { names: toLines(data.bankNames), accounts: toLines(data.bankAccounts) })
        : result

      if (result.success && !saved.success) {
        showToast(saved.error, 'error')
      } else if (result.success) {
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
            disabled={loading || identities === 'loading'}
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
          <label className="mb-1 block text-sm font-medium">Tên chuyển tiền</label>
          <textarea
            {...register('bankNames')}
            rows={2}
            placeholder={'Mỗi dòng một tên, vd: DINH TAN PHUOC'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Số tài khoản</label>
          <textarea
            {...register('bankAccounts')}
            rows={2}
            placeholder="Mỗi dòng một số tài khoản"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-gray-500">
            {identities === 'failed'
              ? 'Không tải được thông tin ngân hàng; lưu sẽ giữ nguyên dữ liệu cũ.'
              : 'Chỉ admin thấy. Dùng để tự nhận diện người chuyển khoản.'}
          </p>
        </div>
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
