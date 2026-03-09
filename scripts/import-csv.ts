/**
 * CSV Import Script for BanBan FC Fund Management
 *
 * Usage:
 *   npx tsx scripts/import-csv.ts [--dry-run] [--verbose]
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const VERBOSE = args.includes('--verbose')

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STATUS_MAP: Record<string, string> = {
  'Đang hoạt động': 'active',
  'Đã nghỉ': 'inactive',
  'Tạm nghỉ': 'paused',
}

const TYPE_MAP: Record<string, string> = {
  'Thu': 'income',
  'Chi': 'expense',
}

interface ImportStats {
  imported: number
  skipped: number
  errors: number
}

function readCsv(filename: string): Record<string, string>[] {
  const filepath = resolve(__dirname, 'data', filename)
  if (!existsSync(filepath)) {
    console.log(`⚠ File not found: ${filepath}, skipping...`)
    return []
  }
  const content = readFileSync(filepath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, bom: true })
}

async function importMembers(): Promise<ImportStats> {
  console.log('\n📋 Importing members...')
  const rows = readCsv('members.csv')
  if (!rows.length) return { imported: 0, skipped: 0, errors: 0 }

  const stats: ImportStats = { imported: 0, skipped: 0, errors: 0 }

  for (const row of rows) {
    const name = row.name?.trim()
    if (!name) { stats.errors++; continue }

    const member = {
      name,
      status: STATUS_MAP[row.status?.trim()] || 'active',
      joined_at: row.joined_at || new Date().toISOString(),
      note: row.note?.trim() || null,
    }

    if (VERBOSE) console.log(`  → ${name} (${member.status})`)

    if (!DRY_RUN) {
      const { error } = await supabase.from('members').upsert(member, { onConflict: 'name' })
      if (error) {
        console.error(`  ✗ ${name}: ${error.message}`)
        stats.errors++
        continue
      }
    }
    stats.imported++
  }

  return stats
}

async function importContributions(): Promise<ImportStats> {
  console.log('\n💰 Importing contributions...')
  const rows = readCsv('contributions.csv')
  if (!rows.length) return { imported: 0, skipped: 0, errors: 0 }

  // Build member name→id map
  const { data: members } = await supabase.from('members').select('id, name')
  const memberMap = new Map<string, string>()
  members?.forEach(m => memberMap.set(m.name.toLowerCase().trim(), m.id))

  const stats: ImportStats = { imported: 0, skipped: 0, errors: 0 }

  for (const row of rows) {
    const memberName = row.member_name?.trim()
    const memberId = memberMap.get(memberName?.toLowerCase() || '')

    if (!memberId) {
      console.error(`  ✗ Member not found: "${memberName}"`)
      stats.errors++
      continue
    }

    const contribution = {
      member_id: memberId,
      month: row.month?.trim(),
      amount: parseInt(row.amount) || 200000,
      paid_at: row.paid_at || new Date().toISOString(),
      note: row.note?.trim() || null,
    }

    if (VERBOSE) console.log(`  → ${memberName} ${contribution.month}: ${contribution.amount}`)

    if (!DRY_RUN) {
      const { error } = await supabase.from('contributions').insert(contribution)
      if (error) {
        if (error.code === '23505') {
          stats.skipped++
          if (VERBOSE) console.log(`    (duplicate, skipped)`)
        } else {
          console.error(`  ✗ ${memberName} ${contribution.month}: ${error.message}`)
          stats.errors++
        }
        continue
      }
    }
    stats.imported++
  }

  return stats
}

async function importTransactions(): Promise<ImportStats> {
  console.log('\n📊 Importing transactions...')
  const rows = readCsv('transactions.csv')
  if (!rows.length) return { imported: 0, skipped: 0, errors: 0 }

  const { data: members } = await supabase.from('members').select('id, name')
  const memberMap = new Map<string, string>()
  members?.forEach(m => memberMap.set(m.name.toLowerCase().trim(), m.id))

  const stats: ImportStats = { imported: 0, skipped: 0, errors: 0 }

  for (const row of rows) {
    const memberName = row.member_name?.trim()
    let memberId: string | null = null
    if (memberName) {
      memberId = memberMap.get(memberName.toLowerCase()) || null
      if (!memberId) {
        console.warn(`  ⚠ Member not matched: "${memberName}", proceeding without link`)
      }
    }

    const transaction = {
      date: row.date || null,
      type: TYPE_MAP[row.type?.trim()] || row.type?.toLowerCase(),
      amount: parseInt(row.amount),
      category: row.category?.trim(),
      description: row.description?.trim() || '',
      member_id: memberId,
      note: row.note?.trim() || null,
    }

    if (!transaction.type || !transaction.amount || !transaction.category) {
      console.error(`  ✗ Invalid row: ${JSON.stringify(row)}`)
      stats.errors++
      continue
    }

    if (VERBOSE) console.log(`  → ${transaction.type} ${transaction.amount} ${transaction.category}`)

    if (!DRY_RUN) {
      const { error } = await supabase.from('transactions').insert(transaction)
      if (error) {
        console.error(`  ✗ ${error.message}`)
        stats.errors++
        continue
      }
    }
    stats.imported++
  }

  return stats
}

async function main() {
  console.log('🏈 BanBan FC — CSV Import')
  if (DRY_RUN) console.log('🔍 DRY RUN MODE — no data will be written')

  const memberStats = await importMembers()
  const contribStats = await importContributions()
  const txStats = await importTransactions()

  console.log('\n📈 Summary:')
  console.log(`  Members:       ${memberStats.imported} imported, ${memberStats.skipped} skipped, ${memberStats.errors} errors`)
  console.log(`  Contributions: ${contribStats.imported} imported, ${contribStats.skipped} skipped, ${contribStats.errors} errors`)
  console.log(`  Transactions:  ${txStats.imported} imported, ${txStats.skipped} skipped, ${txStats.errors} errors`)

  if (DRY_RUN) console.log('\n🔍 This was a dry run. Run without --dry-run to import.')
}

main().catch(console.error)
