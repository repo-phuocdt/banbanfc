import { normalizeText } from './normalize'

const REVERSAL_PHRASES = ['HOAN TIEN', 'HOAN TRA', 'TRA SOAT', 'REFUND']

/** Outgoing money that looks like the bank returning an earlier incoming transfer. */
export function isReversal(content: string): boolean {
  const text = ` ${normalizeText(content)} `
  return REVERSAL_PHRASES.some(p => text.includes(` ${p} `))
}

/** Maps outgoing transfer content to one of EXPENSE_CATEGORIES by keyword. */
export function guessExpenseCategory(content: string): string {
  const words = new Set(normalizeText(content).split(' '))
  const field = words.has('SAN')
  const water = words.has('NUOC')
  if (field && water) return 'Tiền sân + nước'
  if (field) return 'Tiền sân'
  if (water) return 'Tiền nước'
  if (words.has('AO')) return 'Tiền áo/đồ'
  if (words.has('NHAU')) return 'Tiền nhậu'
  return 'Khác'
}
