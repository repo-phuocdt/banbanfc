import type { TransactionWithMember } from '@/lib/types/database'
import { formatCurrency, formatMonth } from './format'

const MONTH_PATTERN = /\d{4}-\d{2}/

function describe(parts: TransactionWithMember[]): string {
  const months = parts.map(p => p.description?.match(MONTH_PATTERN)?.[0])
  // Only contribution rows are rewritten; bank expenses and other income keep their own text.
  if (parts.some(p => !p.contribution_id) || months.some(m => !m)) return parts.map(p => p.description || p.category).join(' + ')
  const detail = parts.length === 1
    ? formatMonth(months[0]!)
    : parts.map((p, i) => `${formatMonth(months[i]!)} (${formatCurrency(p.amount)})`).join(' + ')
  return `Đóng quỹ ${detail} — chuyển khoản`
}

/**
 * One bank transfer is split into one ledger row per month it pays for. For display,
 * merge those rows back into a single row per transfer (amount summed, months listed),
 * keeping the position of the first row and describing every transfer the same way.
 * Rows not from a bank transfer are untouched.
 */
export function groupBankRows(rows: TransactionWithMember[]): TransactionWithMember[] {
  const groups = new Map<string, TransactionWithMember[]>()
  for (const row of rows) {
    if (!row.bank_transaction_id) continue
    groups.set(row.bank_transaction_id, [...(groups.get(row.bank_transaction_id) ?? []), row])
  }

  const result: TransactionWithMember[] = []
  for (const row of rows) {
    const parts = row.bank_transaction_id ? groups.get(row.bank_transaction_id)! : [row]
    if (!row.bank_transaction_id) {
      result.push(row)
    } else if (parts[0] === row) {
      const sorted = [...parts].sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''))
      const names = Array.from(new Set(parts.map(p => p.member_name).filter(Boolean)))
      result.push({
        ...row,
        amount: parts.reduce((sum, p) => sum + p.amount, 0),
        description: describe(sorted),
        member_name: names.length ? names.join(', ') : null,
      })
    }
  }
  return result
}
