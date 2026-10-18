import { digitsOnly, normalizeText } from './normalize'

export interface BankIdentity {
  member_id: string
  kind: 'name' | 'account'
  value: string
}

export type MatchResult =
  | { memberId: string; via: string }
  | { memberId: null; reason: 'none' | 'ambiguous' }

interface Candidate {
  memberId: string
  value: string
}

/**
 * Finds which member sent a transfer from its content. Account numbers win over names;
 * a name match that is a sub-phrase of another matched name is dropped in favor of the longer one.
 * The fund holder's own name is removed first so the receiver part of the content never matches.
 */
export function matchMember(
  content: string,
  identities: BankIdentity[],
  eligibleMemberIds: Set<string>,
  fundHolderName?: string,
): MatchResult {
  let text = ` ${normalizeText(content)} `
  const holder = fundHolderName ? normalizeText(fundHolderName) : ''
  if (holder) text = text.split(` ${holder} `).join('  ')

  const tokens = new Set(text.split(' ').filter(t => /^\d+$/.test(t)))
  const usable = identities.filter(i => eligibleMemberIds.has(i.member_id))

  const byAccount = usable
    .filter(i => i.kind === 'account' && tokens.has(digitsOnly(i.value)))
    .map(i => ({ memberId: i.member_id, value: i.value }))
  const accountResult = pick(byAccount, 'account')
  if (accountResult) return accountResult

  const byName: Candidate[] = usable
    .filter(i => i.kind === 'name' && text.includes(` ${normalizeText(i.value)} `))
    .map(i => ({ memberId: i.member_id, value: normalizeText(i.value) }))
  const specific = byName.filter(c =>
    !byName.some(o => o.memberId !== c.memberId && o.value.length > c.value.length && ` ${o.value} `.includes(` ${c.value} `)),
  )
  return pick(specific, 'name') ?? { memberId: null, reason: byName.length > 0 ? 'ambiguous' : 'none' }
}

function pick(candidates: Candidate[], kind: string): MatchResult | null {
  const members = new Set(candidates.map(c => c.memberId))
  if (members.size === 1) return { memberId: candidates[0].memberId, via: `${kind}:${candidates[0].value}` }
  if (members.size > 1) return { memberId: null, reason: 'ambiguous' }
  return null
}
