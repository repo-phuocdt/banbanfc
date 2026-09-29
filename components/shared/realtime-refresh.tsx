'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_TABLES = ['contributions', 'transactions', 'member_leaves']
const DEBOUNCE_MS = 500

/**
 * Refreshes server-rendered data when fund tables change (e.g. a bank webhook recorded a transfer).
 * RLS applies to realtime, so only admins receive bank_transactions events.
 */
export function RealtimeRefresh({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout> | undefined
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), DEBOUNCE_MS)
    }

    const tables = isAdmin ? [...PUBLIC_TABLES, 'bank_transactions'] : PUBLIC_TABLES
    const channel = supabase.channel('fund-changes')
    tables.forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
    })
    channel.subscribe()

    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [isAdmin, router])

  return null
}
