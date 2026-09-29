/**
 * Sends a SePay-shaped webhook to a running app, for local testing.
 *
 * Usage:
 *   npx tsx scripts/simulate-sepay-webhook.ts --content "DINH TAN PHUOC chuyen tien" --amount 200000
 *   npx tsx scripts/simulate-sepay-webhook.ts --type out --content "tien san T9" --amount 500000
 *   npx tsx scripts/simulate-sepay-webhook.ts --id 42          # resend the same id to test idempotency
 *   npx tsx scripts/simulate-sepay-webhook.ts --key wrong      # expect 401
 * Options: --url (default http://localhost:3000), --account (default FUND_BANK_ACCOUNT), --date "YYYY-MM-DD HH:mm:ss"
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

function vnNow(): string {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

async function main() {
  const url = `${arg('url', 'http://localhost:3000')}/api/webhooks/sepay`
  const key = arg('key', process.env.SEPAY_WEBHOOK_API_KEY)
  const payload = {
    id: Number(arg('id', String(Date.now() % 1_000_000_000))),
    gateway: 'MBBank',
    transactionDate: arg('date', vnNow()),
    accountNumber: arg('account', process.env.FUND_BANK_ACCOUNT || '0000000000'),
    code: null,
    content: arg('content', 'NGUYEN VAN A chuyen tien'),
    transferType: arg('type', 'in'),
    transferAmount: Number(arg('amount', '200000')),
    accumulated: 0,
    subAccount: null,
    referenceCode: arg('ref', `SIM${Date.now()}`),
    description: '',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Apikey ${key ?? ''}` },
    body: JSON.stringify(payload),
  })
  console.log(`POST ${url} id=${payload.id} → ${res.status}`, await res.text())
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
