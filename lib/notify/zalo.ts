// Zalo Bot Platform: https://bot.zapps.me/docs/apis/sendMessage/
// Never log the request URL: it contains the bot token.

const SEND_TIMEOUT_MS = 5000
const MAX_TEXT = 2000

/** Sends a text to the configured chat (group or treasurer). Never throws; returns delivery attempt result. */
export async function sendZalo(text: string): Promise<boolean> {
  const token = process.env.ZALO_BOT_TOKEN
  const chatId = process.env.ZALO_CHAT_ID
  if (!token || !chatId) return false

  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, MAX_TEXT) }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok || body?.ok === false) {
      console.error('[zalo] sendMessage failed', res.status, body?.error_code ?? '')
      return false
    }
    return true
  } catch (error) {
    console.error('[zalo] sendMessage error', (error as Error).name)
    return false
  }
}
