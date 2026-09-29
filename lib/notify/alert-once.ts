// Remembers which failed webhook deliveries were already alerted, outside Supabase,
// so SePay retries (up to 7 in 5 hours) produce one alert and one "recovered" message.
// Uses the Upstash Redis REST API; without it every failure alerts (duplicates accepted).

const TTL_SECONDS = 24 * 60 * 60
const TIMEOUT_MS = 3000

async function upstash(path: string): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return undefined
  try {
    const res = await fetch(`${url}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return undefined
    return (await res.json())?.result
  } catch {
    return undefined
  }
}

const key = (sepayId: number) => `sepay:alerted:${sepayId}`

/** True when this failure has not been alerted yet (or the store is unavailable). */
export async function claimFailureAlert(sepayId: number): Promise<boolean> {
  const result = await upstash(`set/${key(sepayId)}/1/NX/EX/${TTL_SECONDS}`)
  return result !== null // 'OK' = first claim, null = already claimed, undefined = store unavailable
}

/** True when an earlier failure of this transaction was alerted; clears the marker. */
export async function consumeFailureAlert(sepayId: number): Promise<boolean> {
  const deleted = await upstash(`del/${key(sepayId)}`)
  return deleted === 1
}
