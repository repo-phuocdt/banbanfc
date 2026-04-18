'use client'

import { useIsMobile } from '@/hooks/use-is-mobile'
import { MemberTable } from './member-table'
import { MemberList } from '@/components/mobile/member-list'
import type { MemberWithTotal } from '@/lib/types/database'

interface MemberSwitchProps {
  members: MemberWithTotal[]
  isAuthenticated?: boolean
}

export function MemberSwitch({ members, isAuthenticated }: MemberSwitchProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MemberList members={members} isAuthenticated={isAuthenticated} />
  }

  return <MemberTable members={members} isAuthenticated={isAuthenticated} />
}
