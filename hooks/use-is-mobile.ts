'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * SSR-safe hook that detects mobile viewport via matchMedia.
 * Returns null during SSR/hydration to avoid mismatch.
 * Only fires on breakpoint crossing — no per-frame re-renders.
 */
export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
