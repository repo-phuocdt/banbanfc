import { test } from 'node:test'
import assert from 'node:assert/strict'
import { feeForMonth } from './fee-schedule'

const schedule = [
  { effective_month: '2027-01', amount: 250000 },
  { effective_month: '2025-06', amount: 200000 },
]

test('uses the latest row effective on or before the month', () => {
  assert.equal(feeForMonth(schedule, '2026-12'), 200000)
  assert.equal(feeForMonth(schedule, '2027-01'), 250000)
  assert.equal(feeForMonth(schedule, '2028-05'), 250000)
})

test('months before the first row use the first row', () => {
  assert.equal(feeForMonth(schedule, '2024-01'), 200000)
})

test('empty schedule yields 0', () => {
  assert.equal(feeForMonth([], '2026-09'), 0)
})
