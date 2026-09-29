import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Daily Vercel Cron: a tiny query keeps the free Supabase project from pausing after
// 7 idle days, which would otherwise make every SePay webhook retry fail.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { error } = await createServiceClient().from('members').select('id').limit(1)
  if (error) {
    console.error('[keepalive] query failed', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
