'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { markLeave, unmarkLeave } from '@/app/quan-ly-quy/dong-tien/leave-actions'

interface Props {
  memberId: string
  month: string
  isLeave: boolean
  onDone: () => void
}

export function LeaveToggleButton({ memberId, month, isLeave, onDone }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const payload = { member_id: memberId, month }
      const result = isLeave ? await unmarkLeave(payload) : await markLeave(payload)
      if (result.success) {
        showToast(isLeave ? 'Đã bỏ đánh dấu nghỉ' : 'Đã đánh dấu tháng nghỉ')
        onDone()
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
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? 'Đang lưu...' : isLeave ? 'Bỏ nghỉ' : 'Đánh dấu nghỉ'}
    </button>
  )
}
