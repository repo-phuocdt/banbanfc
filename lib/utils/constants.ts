export const DEFAULT_CONTRIBUTION = 200000

export const INCOME_CATEGORIES = [
  'Quỹ hàng tháng',
  'Góp thêm',
  'Tiền dư hoàn lại',
  'Khác',
] as const

export const EXPENSE_CATEGORIES = [
  'Tiền sân',
  'Tiền nước',
  'Tiền sân + nước',
  'Tiền áo/đồ',
  'Tiền nhậu',
  'Khác',
] as const

export const STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động',
  inactive: 'Đã nghỉ',
  paused: 'Tạm nghỉ',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800',
}
