'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Download, Copy, Check } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { QrCodeFormModal } from '@/components/qr-codes/qr-code-form-modal'
import { MobileSheet } from './mobile-sheet'
import { deleteQrCode } from '@/app/quan-ly-quy/qr-chuyen-tien/actions'
import { useToast } from '@/components/ui/toast'
import type { QrCode } from '@/lib/types/database'

interface QrCodeListProps {
  qrCodes: QrCode[]
  isAdmin: boolean
}

export function QrCodeList({ qrCodes, isAdmin }: QrCodeListProps) {
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<QrCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QrCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [detailQr, setDetailQr] = useState<QrCode | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const result = await deleteQrCode(deleteTarget.id)
      if (result.success) {
        showToast('Đã xóa mã QR')
        setDetailQr(null)
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

  if (qrCodes.length === 0) {
    return (
      <>
        <EmptyState
          title="Chưa có mã QR"
          description={isAdmin ? 'Hãy thêm mã QR đầu tiên.' : 'Quản trị viên chưa thêm mã QR nào.'}
        />
        {isAdmin && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg"
          >
            <Plus size={24} />
          </button>
        )}
        <QrCodeFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} qrCode={editing} />
      </>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {qrCodes.map(qr => (
          <div
            key={qr.id}
            className={`rounded-xl bg-white shadow-card overflow-hidden ${!qr.is_active ? 'opacity-60' : ''}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <h3 className="text-sm font-semibold truncate">{qr.title}</h3>
              {!qr.is_active && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Đã tắt</span>
              )}
            </div>

            {/* QR Image */}
            <div className="flex justify-center bg-gray-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr.image_data}
                alt={`QR ${qr.title}`}
                className="h-auto w-full max-w-[260px] rounded-lg object-contain"
              />
            </div>

            {/* Bank details */}
            <div className="px-4 py-3 space-y-1.5">
              {qr.bank_name && <p className="text-sm font-medium text-gray-800">{qr.bank_name}</p>}
              {qr.account_name && <p className="text-sm text-gray-600">{qr.account_name}</p>}

              {/* Copy account number — prominent */}
              {qr.account_number && (
                <button
                  onClick={() => handleCopy(qr)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-50 py-3 font-mono text-sm font-medium text-primary-700 transition-colors active:bg-primary-100"
                >
                  {qr.account_number}
                  {copiedId === qr.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
              )}

              {qr.description && (
                <p className="mt-1 whitespace-pre-line text-xs text-gray-500">{qr.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <a
                href={qr.image_data}
                download={`qr-${qr.title.replace(/\s+/g, '-')}.png`}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
              >
                <Download size={14} />
                Tải ảnh
              </a>
              {isAdmin && (
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditing(qr); setModalOpen(true) }}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(qr)}
                    className="rounded p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      {isAdmin && (
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
          aria-label="Thêm mã QR"
        >
          <Plus size={24} />
        </button>
      )}

      <QrCodeFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
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
