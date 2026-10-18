'use client'

import { useIsMobile } from '@/hooks/use-is-mobile'
import { ContributionMatrix } from './contribution-matrix'
import { ContributionView } from '@/components/mobile/contribution-view'
import type { Contribution, Member, MemberLeave, MonthlyFee } from '@/lib/types/database'

interface ContributionSwitchProps {
  contributions: Contribution[]
  members: Member[]
  leaves: MemberLeave[]
  fees: MonthlyFee[]
  isAuthenticated?: boolean
}

export function ContributionSwitch({ contributions, members, leaves, fees, isAuthenticated }: ContributionSwitchProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <ContributionView contributions={contributions} members={members} leaves={leaves} fees={fees} isAuthenticated={isAuthenticated} />
  }

  return <ContributionMatrix contributions={contributions} members={members} leaves={leaves} fees={fees} isAuthenticated={isAuthenticated} />
}
