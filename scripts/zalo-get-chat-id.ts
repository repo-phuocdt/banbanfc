/**
 * Lists recent chats that messaged the Zalo bot, to find ZALO_CHAT_ID.
 * First @mention the bot in the team group (or message it 1-1), then run:
 *   npx tsx scripts/zalo-get-chat-id.ts
 *   npx tsx scripts/zalo-get-chat-id.ts --send "Xin chào"   # test sending to ZALO_CHAT_ID
 * Reads ZALO_BOT_TOKEN from .env.local; the token is never printed.
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const token = process.env.ZALO_BOT_TOKEN
const api = (method: string) => `https://bot-api.zaloplatforms.com/bot${token}/${method}`

async function main() {
  if (!token) throw new Error('Thiếu ZALO_BOT_TOKEN trong .env.local')

  const sendIndex = process.argv.indexOf('--send')
  if (sendIndex >= 0) {
    const res = await fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.ZALO_CHAT_ID, text: process.argv[sendIndex + 1] ?? 'Test' }),
    })
    console.log('sendMessage →', res.status, await res.text())
    console.log('Lưu ý: ok:true chưa chắc tin đã tới nhóm, hãy mở nhóm kiểm tra.')
    return
  }

  const res = await fetch(api('getUpdates'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeout: 30 }),
  })
  const body = await res.json()
  if (!body.ok) {
    console.log('getUpdates lỗi (nếu bot đã setWebhook thì getUpdates không dùng được):', body)
    return
  }
  const updates = Array.isArray(body.result) ? body.result : [body.result]
  for (const u of updates.filter(Boolean)) {
    const chat = u.message?.chat
    console.log(`chat_id=${chat?.id} type=${chat?.chat_type} from=${u.message?.from?.display_name ?? ''} text=${u.message?.text ?? ''}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
