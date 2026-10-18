import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBankMonthlyStats, UNCATEGORIZED, type BankStatRow } from './monthly-stats'

function row(date: string, type: 'in' | 'out', amount: number, status: BankStatRow['status'] = 'applied', categories: string[] = []): BankStatRow {
  return { transaction_date: date, transfer_type: type, amount, status, categories }
}

test('fills the window with empty months, oldest first', () => {
  const stats = buildBankMonthlyStats([], '2026-02', 3)
  assert.deepEqual(stats.map(s => s.month), ['2025-12', '2026-01', '2026-02'])
  assert.equal(stats[0].in + stats[0].out, 0)
})

test('groups by Vietnam month, not UTC month', () => {
  // 2026-08-31 18:00 UTC is 2026-09-01 01:00 in Vietnam.
  const stats = buildBankMonthlyStats([row('2026-08-31T18:00:00Z', 'in', 200000)], '2026-09', 2)
  assert.equal(stats[0].in, 0)
  assert.equal(stats[1].in, 200000)
})

test('totals in/out, counts, status split and expense categories', () => {
  const [sep] = buildBankMonthlyStats([
    row('2026-09-05T03:00:00Z', 'in', 200000),
    row('2026-09-06T03:00:00Z', 'in', 700000, 'pending'),
    row('2026-09-07T03:00:00Z', 'out', 500000, 'applied', ['Tiền sân']),
    row('2026-09-08T03:00:00Z', 'out', 300000, 'applied', ['Tiền sân']),
    row('2026-09-09T03:00:00Z', 'out', 50000, 'ignored'),
    row('2026-09-10T03:00:00Z', 'out', 100000, 'applied', ['Tiền nước']),
  ], '2026-09', 1)
  assert.equal(sep.in, 900000)
  assert.equal(sep.out, 950000)
  assert.equal(sep.inCount, 2)
  assert.equal(sep.outCount, 4)
  assert.deepEqual(sep.byStatus.pending, { in: 700000, out: 0 })
  assert.deepEqual(sep.byStatus.ignored, { in: 0, out: 50000 })
  assert.deepEqual(sep.outByCategory, [
    { category: 'Tiền sân', amount: 800000 },
    { category: 'Tiền nước', amount: 100000 },
    { category: UNCATEGORIZED, amount: 50000 },
  ])
})

test('ignores rows outside the window', () => {
  const stats = buildBankMonthlyStats([row('2025-01-10T03:00:00Z', 'in', 200000)], '2026-09', 12)
  assert.equal(stats.reduce((s, m) => s + m.in, 0), 0)
})
