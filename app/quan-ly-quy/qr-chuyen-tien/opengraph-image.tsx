import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 60

export const alt = 'Chuyển quỹ Ban Ban FC'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getPrimaryQr() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const { data } = await supabase
      .from('qr_codes')
      .select('title, bank_name, account_name, account_number, image_data')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    return data
  } catch {
    return null
  }
}

export default async function Image() {
  const qr = await getPrimaryQr()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: 48,
        }}
      >
        {/* Left: Bank info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingRight: 32,
          }}
        >
          <div style={{ fontSize: 28, color: '#93C5FD', marginBottom: 8 }}>
            Ban Ban FC
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Chuyển quỹ
          </div>

          {qr ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {qr.bank_name && (
                <div style={{ fontSize: 28, color: '#FDE68A', fontWeight: 700 }}>
                  {qr.bank_name}
                </div>
              )}
              {qr.account_name && (
                <div style={{ fontSize: 24, color: '#E0E7FF' }}>
                  {qr.account_name}
                </div>
              )}
              {qr.account_number && (
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: 'white',
                    fontFamily: 'monospace',
                    marginTop: 8,
                    letterSpacing: 2,
                  }}
                >
                  {qr.account_number}
                </div>
              )}
              <div style={{ fontSize: 20, color: '#93C5FD', marginTop: 16 }}>
                Quét mã QR hoặc chuyển khoản →
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 26, color: '#E0E7FF' }}>
              Quét mã QR để chuyển quỹ
            </div>
          )}
        </div>

        {/* Right: QR Code */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 480,
            height: 480,
            background: 'white',
            borderRadius: 28,
            padding: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {qr?.image_data ? (
            /* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */
            <img
              src={qr.image_data}
              width={440}
              height={440}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#64748B',
                textAlign: 'center',
              }}
            >
              Chưa có mã QR
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
