'use client'

import { useIsMobile } from '@/hooks/use-is-mobile'
import { ContributionMatrix } from './contribution-matrix'
import { ContributionView } from '@/components/mobile/contribution-view'
import type { Contribution, Member, MemberLeave } from '@/lib/types/database'

interface ContributionSwitchProps {
  contributions: Contribution[]
  members: Member[]
  leaves: MemberLeave[]
  isAuthenticated?: boolean
}

export function ContributionSwitch({ contributions, members, leaves, isAuthenticated }: ContributionSwitchProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <ContributionView contributions={contributions} members={members} leaves={leaves} isAuthenticated={isAuthenticated} />
  }

  return <ContributionMatrix contributions={contributions} members={members} leaves={leaves} isAuthenticated={isAuthenticated} />
}
