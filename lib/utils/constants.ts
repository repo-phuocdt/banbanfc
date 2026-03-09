export const DEFAULT_CONTRIBUTION = 200000

export const INCOME_CATEGORIES = [
  'Quỹ hàng tháng',
  'Tài trợ',
  'Bán đồ cũ',
  'Phạt',
  'Khác (thu)',
] as const

export const EXPENSE_CATEGORIES = [
  'Thuê sân',
  'Nước uống',
  'Trang phục',
  'Bóng',
  'Y tế',
  'Giải đấu',
  'Liên hoan',
  'Khác (chi)',
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
