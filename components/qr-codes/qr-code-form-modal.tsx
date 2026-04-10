'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { createQrCode, updateQrCode } from '@/app/quan-ly-quy/qr-chuyen-tien/actions'
import type { QrCode } from '@/lib/types/database'

interface Props {
  open: boolean
  onClose: () => void
  qrCode: QrCode | null
}

interface FormValues {
  title: string
  bank_name: string
  account_name: string
  account_number: string
  description: string
  display_order: number
  is_active: boolean
}

const MAX_BYTES = 1_000_000 // 1MB
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function QrCodeFormModal({ open, onClose, qrCode }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageData, setImageData] = useState<string>('')
  const [imageMime, setImageMime] = useState<string>('image/png')
  const [imageError, setImageError] = useState<string>('')
  const isEdit = !!qrCode

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: 'Chuyển khoản quỹ',
      bank_name: '',
      account_name: '',
      account_number: '',
      description: '',
      display_order: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    if (qrCode) {
      reset({
        title: qrCode.title,
        bank_name: qrCode.bank_name || '',
        account_name: qrCode.account_name || '',
        account_number: qrCode.account_number || '',
        description: qrCode.description || '',
        display_order: qrCode.display_order,
        is_active: qrCode.is_active,
      })
      setImageData(qrCode.image_data)
      setImageMime(qrCode.image_mime || 'image/png')
    } else {
      reset({
        title: 'Chuyển khoản quỹ',
        bank_name: '',
        account_name: '',
        account_number: '',
        description: '',
        display_order: 0,
        is_active: true,
      })
      setImageData('')
      setImageMime('image/png')
    }
    setImageError('')
  }, [qrCode, reset, open])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_MIMES.includes(file.type)) {
      setImageError('Chỉ chấp nhận PNG, JPG, WEBP hoặc GIF')
      return
    }
    if (file.size > MAX_BYTES) {
      setImageError('Ảnh quá lớn, vui lòng chọn ảnh dưới 1MB')
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setImageData(dataUrl)
      setImageMime(file.type)
      setImageError('')
    } catch {
      setImageError('Không đọc được ảnh')
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!imageData) {
      setImageError('Vui lòng chọn ảnh QR')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        bank_name: data.bank_name || null,
        account_name: data.account_name || null,
        account_number: data.account_number || null,
        description: data.description || null,
        image_data: imageData,
        image_mime: imageMime,
        display_order: Number(data.display_order) || 0,
        is_active: data.is_active,
      }
      const result = isEdit
        ? await updateQrCode(qrCode!.id, payload)
        : await createQrCode(payload)

      if (result.success) {
        showToast(isEdit ? 'Đã cập nhật mã QR' : 'Đã thêm mã QR')
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
      title={isEdit ? 'Sửa mã QR' : 'Thêm mã QR'}
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
          <label className="mb-1 block text-sm font-medium">Ảnh QR *</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-primary hover:bg-primary-50">
            <Upload size={18} />
            <span>{imageData ? 'Chọn ảnh khác' : 'Bấm để chọn ảnh (tối đa 1MB)'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
          {imageData && (
            <div className="mt-3 flex justify-center rounded-lg bg-gray-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageData}
                alt="Xem trước"
                className="max-h-48 rounded object-contain"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tiêu đề *</label>
          <input
            {...register('title', { required: 'Tiêu đề không được để trống' })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="VD: Chuyển khoản quỹ"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Ngân hàng</label>
            <input
              {...register('bank_name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="VD: Vietcombank"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Chủ tài khoản</label>
            <input
              {...register('account_name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="VD: DINH TAN PHUOC"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Số tài khoản</label>
          <input
            {...register('account_number')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="VD: 1234567890"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Nội dung chuyển khoản, ghi chú..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Thứ tự hiển thị</label>
            <input
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('is_active')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Hiển thị mã QR này
            </label>
          </div>
        </div>
      </form>
    </Modal>
  )
}
