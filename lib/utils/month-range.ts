import { addMonths, monthOf } from '@/lib/bank/month'

/** Continuous 'YYYY-MM' range from the earliest known month to max(current, latest), plus extra months. */
export function buildMonthRange(knownMonths: string[], extraMonths = 0): string[] {
  const current = monthOf(new Date())
  const sorted = [...knownMonths].sort()
  const start = sorted[0] ?? current
  const latest = sorted[sorted.length - 1] ?? current
  const end = current > latest ? current : latest

  const result: string[] = []
  for (let m = start; m <= end; m = addMonths(m, 1)) result.push(m)
  for (let i = 1; i <= extraMonths; i++) result.push(addMonths(end, i))
  return result
}

export const leaveKey = (memberId: string, month: string) => `${memberId}:${month}`
