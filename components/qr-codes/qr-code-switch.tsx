'use client'

import { useIsMobile } from '@/hooks/use-is-mobile'
import { QrCodeManager } from './qr-code-manager'
import { QrCodeList } from '@/components/mobile/qr-code-list'
import type { QrCode } from '@/lib/types/database'

interface QrCodeSwitchProps {
  qrCodes: QrCode[]
  isAdmin: boolean
}

export function QrCodeSwitch({ qrCodes, isAdmin }: QrCodeSwitchProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <QrCodeList qrCodes={qrCodes} isAdmin={isAdmin} />
  }

  return <QrCodeManager qrCodes={qrCodes} isAdmin={isAdmin} />
}
