/**
 * Seeds (or removes) demo bank transactions so the dashboard bank statistics can be
 * checked by eye. Staging only: the target project ref must be passed explicitly.
 *
 *   npx tsx --env-file=.env.local scripts/seed-bank-demo.ts --confirm-ref <project-ref> [--months 6]
 *   npx tsx --env-file=.env.local scripts/seed-bank-demo.ts --confirm-ref <project-ref> --clean
 *
 * Applied demo rows also create ledger rows (via apply_bank_simple); --clean reverts
 * and deletes everything the seed produced. Demo rows are tagged with note = 'seed-demo'.
 */
import { parseArgs } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { addMonths, monthOf } from '../lib/bank/month'

const TAG = 'seed-demo'
const SEPAY_ID_BASE = 9_000_000_000

const { values } = parseArgs({
  options: { 'confirm-ref': { type: 'string' }, months: { type: 'string', default: '6' }, clean: { type: 'boolean', default: false } },
})
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
if (!values['confirm-ref'] || new URL(url).hostname.split('.')[0] !== values['confirm-ref']) {
  console.error('Refusing to run: --confirm-ref must equal the project ref in NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function clean() {
  const { data, error } = await db.from('bank_transactions').select('id, status').eq('note', TAG)
  if (error) throw error
  for (const row of data ?? []) {
    if (row.status !== 'pending') {
      const r = await db.rpc('revert_bank_transaction', { p_bank_tx_id: row.id })
      if (r.error) throw r.error
    }
  }
  const d = await db.from('bank_transactions').delete().eq('note', TAG)
  if (d.error) throw d.error
  console.log(`removed ${data?.length ?? 0} demo bank transactions`)
}

type Demo = { day: number; type: 'in' | 'out'; amount: number; content: string; status: 'applied' | 'pending' | 'ignored'; category?: string }

function monthPlan(index: number): Demo[] {
  const payers = 10 + ((index * 7) % 9)
  const rows: Demo[] = Array.from({ length: payers }, (_, i) => ({
    day: 1 + ((i * 3) % 27), type: 'in', amount: 200000, content: `THANH VIEN ${i + 1} chuyen tien`, status: 'applied', category: 'Góp thêm',
  }))
  rows.push({ day: 12, type: 'in', amount: 700000, content: 'NGUYEN VAN A chuyen tien', status: 'pending' })
  for (const week of [0, 1, 2, 3]) {
    rows.push({ day: 3 + week * 7, type: 'out', amount: 500000, content: 'tien san', status: 'applied', category: 'Tiền sân' })
  }
  rows.push({ day: 15, type: 'out', amount: 120000 + index * 10000, content: 'tien nuoc', status: 'applied', category: 'Tiền nước' })
  if (index % 2 === 0) rows.push({ day: 20, type: 'out', amount: 350000, content: 'mua ao', status: 'applied', category: 'Tiền áo/đồ' })
  if (index % 3 === 0) rows.push({ day: 25, type: 'out', amount: 22000, content: 'phi dich vu', status: 'ignored' })
  return rows
}

async function seed(months: number) {
  const current = monthOf(new Date())
  let n = 0
  for (let i = 0; i < months; i++) {
    const month = addMonths(current, -i)
    for (const demo of monthPlan(i)) {
      n += 1
      const date = `${month}-${String(Math.min(demo.day, 28)).padStart(2, '0')}T10:00:00+07:00`
      if (new Date(date) > new Date()) continue
      const { data, error } = await db.from('bank_transactions').insert({
        sepay_id: SEPAY_ID_BASE + n,
        gateway: 'MBBank',
        transaction_date: date,
        account_number: 'DEMO',
        transfer_type: demo.type,
        amount: demo.amount,
        content: demo.content,
        raw: { demo: true },
        status: demo.status === 'ignored' ? 'ignored' : 'pending',
        pending_reason: demo.status === 'pending' ? 'over_threshold' : null,
        note: TAG,
      }).select('id').single()
      if (error) throw error
      if (demo.status === 'applied') {
        const r = await db.rpc('apply_bank_simple', {
          p_bank_tx_id: data.id, p_category: demo.category, p_description: `[Demo] ${demo.content}`, p_matched_via: TAG,
        })
        if (r.error) throw r.error
      }
    }
  }
  console.log(`seeded demo bank transactions for ${months} months`)
}

;(values.clean ? clean() : clean().then(() => seed(Number(values.months)))).catch(err => {
  console.error(err.message ?? err)
  process.exit(1)
})
