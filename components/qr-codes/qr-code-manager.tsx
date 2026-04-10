'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Download, Copy, Check } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { QrCodeFormModal } from './qr-code-form-modal'
import { deleteQrCode } from '@/app/quan-ly-quy/qr-chuyen-tien/actions'
import { useToast } from '@/components/ui/toast'
import type { QrCode } from '@/lib/types/database'

interface Props {
  qrCodes: QrCode[]
  isAdmin: boolean
}

export function QrCodeManager({ qrCodes, isAdmin }: Props) {
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<QrCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QrCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteQrCode(deleteTarget.id)
      if (result.success) {
        showToast('Đã xóa mã QR')
      } else {
        showToast(result.error, 'error')
      }
    } catch {
      showToast('Lỗi khi xóa', 'error')
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  const handleCopy = async (qr: QrCode) => {
    if (!qr.account_number) return
    try {
      await navigator.clipboard.writeText(qr.account_number)
      setCopiedId(qr.id)
      showToast('Đã sao chép số tài khoản')
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      showToast('Không thể sao chép', 'error')
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            <Plus size={16} />
            Thêm mã QR
          </button>
        </div>
      )}

      {qrCodes.length === 0 ? (
        <EmptyState
          title="Chưa có mã QR"
          description={
            isAdmin
              ? 'Hãy thêm mã QR đầu tiên để các thành viên có thể chuyển quỹ.'
              : 'Quản trị viên chưa thêm mã QR chuyển tiền nào.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map(qr => (
            <div
              key={qr.id}
              className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-card transition-shadow hover:shadow-card-hover ${
                !qr.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                <h3 className="truncate text-sm font-semibold">{qr.title}</h3>
                {!qr.is_active && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Đã tắt
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center bg-gray-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.image_data}
                  alt={`QR ${qr.title}`}
                  className="h-auto max-h-80 w-full max-w-xs rounded-lg object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col gap-1 px-4 py-3 text-sm">
                {qr.bank_name && (
                  <div className="font-medium text-gray-800">{qr.bank_name}</div>
                )}
                {qr.account_name && (
                  <div className="text-gray-600">{qr.account_name}</div>
                )}
                {qr.account_number && (
                  <button
                    onClick={() => handleCopy(qr)}
                    className="flex items-center gap-2 self-start rounded-md bg-primary-50 px-2 py-1 font-mono text-xs text-primary-700 transition-colors hover:bg-primary-100"
                    title="Bấm để sao chép"
                  >
                    {qr.account_number}
                    {copiedId === qr.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
                {qr.description && (
                  <div className="mt-1 whitespace-pre-line text-xs text-gray-500">
                    {qr.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t px-4 py-2">
                <a
                  href={qr.image_data}
                  download={`qr-${qr.title.replace(/\s+/g, '-')}.png`}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title="Tải ảnh QR"
                >
                  <Download size={14} />
                  Tải ảnh
                </a>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(qr)
                        setModalOpen(true)
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Sửa"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(qr)}
                      className="rounded p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <QrCodeFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        qrCode={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa mã QR"
        message={`Bạn có chắc muốn xóa mã QR "${deleteTarget?.title}"?`}
        danger
        loading={loading}
      />
    </div>
  )
}
