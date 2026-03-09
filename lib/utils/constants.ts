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
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-rose-50 text-rose-700',
  paused: 'bg-amber-50 text-amber-700',
}
