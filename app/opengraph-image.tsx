import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 60

export const alt = 'Ban Ban FC - Quỹ đội bóng'
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
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingRight: 40,
          }}
        >
          <div style={{ fontSize: 32, color: '#93C5FD', marginBottom: 12 }}>
            Ban Ban FC
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Quỹ đội bóng
          </div>
          {qr ? (
            <>
              <div style={{ fontSize: 30, color: '#E0E7FF', marginBottom: 8 }}>
                Quét mã QR để chuyển quỹ
              </div>
              {qr.bank_name && (
                <div style={{ fontSize: 28, color: '#FDE68A', marginTop: 16 }}>
                  {qr.bank_name}
                </div>
              )}
              {qr.account_name && (
                <div style={{ fontSize: 26, color: 'white' }}>
                  {qr.account_name}
                </div>
              )}
              {qr.account_number && (
                <div
                  style={{
                    fontSize: 28,
                    color: 'white',
                    fontFamily: 'monospace',
                    marginTop: 4,
                  }}
                >
                  {qr.account_number}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 30, color: '#E0E7FF' }}>
              Quản lý quỹ, đóng góp & thu chi
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 460,
            height: 460,
            background: 'white',
            borderRadius: 32,
            padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {qr?.image_data ? (
            /* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */
            <img
              src={qr.image_data}
              width={412}
              height={412}
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
