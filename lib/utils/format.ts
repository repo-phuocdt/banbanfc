import { format, parse } from 'date-fns'
import { vi } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN')
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: vi })
}

export function formatMonth(month: string): string {
  // 'YYYY-MM' → 'T8/2025'
  const [year, m] = month.split('-')
  return `T${parseInt(m)}/${year}`
}

export function formatMonthShort(month: string): string {
  // 'YYYY-MM' → 'T8/25'
  const [year, m] = month.split('-')
  return `T${parseInt(m)}/${year.slice(2)}`
}
