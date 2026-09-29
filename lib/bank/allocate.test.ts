import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allocate, type AllocateInput } from './allocate'
import { addMonths, monthOf } from './month'

const base: AllocateInput = {
  amount: 200000,
  refMonth: '2026-09',
  paidByMonth: {},
  leaveMonths: new Set(),
  fee: 200000,
  maxAhead: 12,
  maxAutoAmount: 600000,
}

function months(input: Partial<AllocateInput>) {
  const result = allocate({ ...base, ...input })
  assert.ok(result.ok, `expected ok, got ${JSON.stringify(result)}`)
  return result.allocations.map(a => `${a.month}:${a.amount}`)
}

test('September already paid → October', () => {
  assert.deepEqual(months({ paidByMonth: { '2026-08': 200000, '2026-09': 200000 } }), ['2026-10:200000'])
})

test('August and September unpaid, 400k → August + September', () => {
  assert.deepEqual(months({ amount: 400000 }), ['2026-08:200000', '2026-09:200000'])
})

test('August unpaid, September on leave, 400k → August + October', () => {
  assert.deepEqual(months({ amount: 400000, leaveMonths: new Set(['2026-09']) }), ['2026-08:200000', '2026-10:200000'])
})

test('paid through September, 600k → October, November, December', () => {
  const paid = { '2026-08': 200000, '2026-09': 200000 }
  assert.deepEqual(months({ amount: 600000, paidByMonth: paid }), ['2026-10:200000', '2026-11:200000', '2026-12:200000'])
})

test('remainder carries into next month as partial payment', () => {
  assert.deepEqual(months({ amount: 250000 }), ['2026-08:200000', '2026-09:50000'])
})

test('partial month is topped up first', () => {
  const paid = { '2026-08': 200000, '2026-09': 50000 }
  const result = allocate({ ...base, amount: 150000, paidByMonth: paid })
  assert.ok(result.ok)
  assert.deepEqual(result.allocations, [{ month: '2026-09', amount: 150000, expectedPaid: 50000 }])
})

test('older debt (July) is never auto-filled', () => {
  assert.deepEqual(months({ paidByMonth: { '2026-08': 200000 } }), ['2026-09:200000'])
})

test('new member: months before joining count as settled', () => {
  assert.deepEqual(months({ joinedMonth: '2026-09' }), ['2026-09:200000'])
  assert.deepEqual(months({ amount: 400000, joinedMonth: '2026-10' }), ['2026-10:200000', '2026-11:200000'])
})

test('amount above auto threshold is rejected', () => {
  assert.deepEqual(allocate({ ...base, amount: 800000 }), { ok: false, reason: 'over_threshold' })
})

test('admin assignment beyond the 12-month cap overflows', () => {
  assert.deepEqual(allocate({ ...base, amount: 3000000, maxAutoAmount: null }), { ok: false, reason: 'overflow' })
})

test('admin assignment without threshold fills many months', () => {
  assert.equal(months({ amount: 1200000, maxAutoAmount: null }).length, 6)
})

test('invalid amounts are rejected', () => {
  assert.deepEqual(allocate({ ...base, amount: 0 }), { ok: false, reason: 'invalid_amount' })
  assert.deepEqual(allocate({ ...base, amount: -5 }), { ok: false, reason: 'invalid_amount' })
})

test('year boundary: January transfer looks back to December', () => {
  assert.deepEqual(months({ refMonth: '2027-01' }), ['2026-12:200000'])
  assert.equal(addMonths('2026-12', 1), '2027-01')
  assert.equal(addMonths('2027-01', -1), '2026-12')
})

test('23:59 on Aug 31 Vietnam time (16:59 UTC) belongs to August', () => {
  assert.equal(monthOf(new Date('2026-08-31T16:59:00Z')), '2026-08')
  assert.equal(monthOf(new Date('2026-08-31T17:00:00Z')), '2026-09')
})
