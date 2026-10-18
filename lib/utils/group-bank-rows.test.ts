import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groupBankRows } from './group-bank-rows'
import type { TransactionWithMember } from '@/lib/types/database'

function row(id: string, amount: number, description: string, bank?: string, member = 'Phước'): TransactionWithMember {
  return {
    id, amount, description, type: 'income', category: 'Quỹ hàng tháng', date: '2026-09-29',
    member_id: 'm1', contribution_id: bank ? `c-${id}` : null, bank_transaction_id: bank ?? null, created_at: '', member_name: member,
  } as TransactionWithMember
}

test('merges the monthly rows of one transfer into one row at the first position', () => {
  const rows = [
    row('a', 50000, 'Tiền nước'),
    row('b', 100000, 'Đóng quỹ tháng 2027-01 (chuyển khoản)', 'bt1'),
    row('c', 100000, 'Đóng quỹ tháng 2026-12 (chuyển khoản)', 'bt1'),
    row('d', 200000, 'Đóng quỹ tháng 2026-11 (chuyển khoản)', 'bt2'),
  ]
  const grouped = groupBankRows(rows)
  assert.deepEqual(grouped.map(r => r.id), ['a', 'b', 'd'])
  assert.equal(grouped[1].amount, 200000)
  assert.match(grouped[1].description ?? '', /T12\/2026 \(100\.000\) \+ T1\/2027 \(100\.000\)/)
  assert.equal(grouped[2].description, 'Đóng quỹ T11/2026 — chuyển khoản')
})

test('lists every member when an admin split one transfer', () => {
  const grouped = groupBankRows([
    row('a', 200000, 'Đóng quỹ tháng 2026-09 (chuyển khoản)', 'bt1', 'An'),
    row('b', 200000, 'Đóng quỹ tháng 2026-09 (chuyển khoản)', 'bt1', 'Bình'),
  ])
  assert.equal(grouped.length, 1)
  assert.equal(grouped[0].amount, 400000)
  assert.equal(grouped[0].member_name, 'An, Bình')
})

test('keeps the description of bank expenses even if it mentions a month', () => {
  const expense = { ...row('e', 500000, 'tien san 2026-10', 'bt9'), type: 'expense', contribution_id: null } as TransactionWithMember
  assert.equal(groupBankRows([expense])[0].description, 'tien san 2026-10')
})
