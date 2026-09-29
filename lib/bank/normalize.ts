// Text normalization shared by matching, learning and sanitizing.

/** Uppercase ASCII words separated by single spaces ("Đinh Tấn Phước" → "DINH TAN PHUOC"). */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '')
}

/** Masks long digit runs (account numbers) so bank content can be shown publicly. */
export function sanitizeContent(content: string): string {
  return content.replace(/\d{6,}/g, '***').trim()
}

/** Best-effort sender name from default bank content, e.g. "DINH TAN PHUOC CHUYEN TIEN". */
export function extractSenderName(content: string): string | null {
  const text = normalizeText(content)
  const idx = text.search(/\b(CHUYEN TIEN|CHUYEN KHOAN|CK)\b/)
  if (idx < 0) return null
  const head = text.slice(0, idx)
  // Bank prefixes carry digits (e.g. "MBVCB 1234567 012345"); keep only the trailing pure-letter words.
  const words = head.trim().split(' ').filter(Boolean)
  const name: string[] = []
  for (let i = words.length - 1; i >= 0; i--) {
    if (/\d/.test(words[i])) break
    name.unshift(words[i])
  }
  return name.length >= 2 ? name.join(' ') : null
}
