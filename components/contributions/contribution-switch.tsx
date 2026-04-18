'use client'

import { useIsMobile } from '@/hooks/use-is-mobile'
import { ContributionMatrix } from './contribution-matrix'
import { ContributionView } from '@/components/mobile/contribution-view'
import type { Contribution, Member } from '@/lib/types/database'

interface ContributionSwitchProps {
  contributions: Contribution[]
  members: Member[]
  isAuthenticated?: boolean
}

export function ContributionSwitch({ contributions, members, isAuthenticated }: ContributionSwitchProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <ContributionView contributions={contributions} members={members} isAuthenticated={isAuthenticated} />
  }

  return <ContributionMatrix contributions={contributions} members={members} isAuthenticated={isAuthenticated} />
}
