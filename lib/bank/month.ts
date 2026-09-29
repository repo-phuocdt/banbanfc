// Month helpers for 'YYYY-MM' strings. Bank dates are interpreted in Vietnam time.

export const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export function monthOf(date: Date, timeZone = VN_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' })
    .formatToParts(date)
  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  return `${year}-${month}`
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const index = y * 12 + (m - 1) + delta
  const year = Math.floor(index / 12)
  const mm = (index % 12) + 1
  return `${year}-${String(mm).padStart(2, '0')}`
}
