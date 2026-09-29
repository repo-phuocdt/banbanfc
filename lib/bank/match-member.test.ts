import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchMember, type BankIdentity } from './match-member'
import { extractSenderName, normalizeText, sanitizeContent } from './normalize'
import { guessExpenseCategory, isReversal } from './expense-category'

const ids: BankIdentity[] = [
  { member_id: 'phuoc', kind: 'name', value: 'DINH TAN PHUOC' },
  { member_id: 'phuoc', kind: 'account', value: '0123456789' },
  { member_id: 'tuan', kind: 'name', value: 'TRAN VAN TUAN' },
  { member_id: 'an', kind: 'name', value: 'AN' },
  { member_id: 'short', kind: 'name', value: 'PHUOC' },
  { member_id: 'old', kind: 'name', value: 'LE VAN CU' },
]
const eligible = new Set(['phuoc', 'tuan', 'an', 'short'])

test('matches default content by sender name', () => {
  assert.deepEqual(matchMember('DINH TAN PHUOC chuyen tien', ids, eligible), { memberId: 'phuoc', via: 'name:DINH TAN PHUOC' })
})

test('matches Vietnamese diacritics and lowercase', () => {
  assert.equal(matchMember('Đinh Tấn Phước chuyển tiền quỹ', ids, eligible).memberId, 'phuoc')
})

test('account number wins over names', () => {
  const r = matchMember('MBVCB.111.CT tu 0123456789 TRAN VAN TUAN toi quy', ids, eligible)
  assert.deepEqual(r, { memberId: 'phuoc', via: 'account:0123456789' })
})

test('longer name beats a shorter name it contains', () => {
  assert.equal(matchMember('DINH TAN PHUOC CK', ids, eligible).memberId, 'phuoc')
  assert.equal(matchMember('PHUOC dong quy', ids, eligible).memberId, 'short')
})

test('two different members in one transfer is ambiguous', () => {
  assert.deepEqual(matchMember('DINH TAN PHUOC TRAN VAN TUAN dong quy', ids, eligible), { memberId: null, reason: 'ambiguous' })
})

test('short name only matches whole words', () => {
  assert.deepEqual(matchMember('NGUYEN VAN ANH chuyen tien', ids, eligible), { memberId: null, reason: 'none' })
  assert.deepEqual(matchMember('DINH TAN PHUOC', [{ member_id: 'an', kind: 'name', value: 'AN' }], eligible), { memberId: null, reason: 'none' })
})

test('fund holder name in receiver part is ignored', () => {
  const r = matchMember('TRAN VAN TUAN chuyen tien toi DINH TAN PHUOC', ids, eligible, 'Đinh Tấn Phước')
  assert.equal(r.memberId, 'tuan')
})

test('inactive or deleted members are not matched', () => {
  assert.deepEqual(matchMember('LE VAN CU chuyen tien', ids, eligible), { memberId: null, reason: 'none' })
})

test('no identity in content → none', () => {
  assert.deepEqual(matchMember('tien quy thang 9', ids, eligible), { memberId: null, reason: 'none' })
})

test('normalize, sanitize and sender extraction', () => {
  assert.equal(normalizeText('  Đinh-Tấn  Phước! '), 'DINH TAN PHUOC')
  assert.equal(sanitizeContent('CT tu 0123456789 toi 12'), 'CT tu *** toi 12')
  assert.equal(extractSenderName('MBVCB.12345.678.DINH TAN PHUOC chuyen tien'), 'DINH TAN PHUOC')
  assert.equal(extractSenderName('tien quy'), null)
})

test('expense categories and reversals', () => {
  assert.equal(guessExpenseCategory('tien san T9'), 'Tiền sân')
  assert.equal(guessExpenseCategory('Tiền sân + nước'), 'Tiền sân + nước')
  assert.equal(guessExpenseCategory('mua nuoc'), 'Tiền nước')
  assert.equal(guessExpenseCategory('dat ao dau'), 'Tiền áo/đồ')
  assert.equal(guessExpenseCategory('chuyen khoan'), 'Khác')
  assert.equal(isReversal('HOAN TIEN GD 12345'), true)
  assert.equal(isReversal('tra soat giao dich'), true)
  assert.equal(isReversal('tien san'), false)
})

test('match descriptions never expose full account numbers', async () => {
  const { describeMatch } = await import('../notify/messages')
  assert.equal(describeMatch('account:0123456789'), 'số TK …6789')
  assert.equal(describeMatch('name:DINH TAN PHUOC'), 'tên DINH TAN PHUOC')
})
