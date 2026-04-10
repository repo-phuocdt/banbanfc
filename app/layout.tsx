import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Ban Ban FC - Quản Lý Quỹ',
  description: 'Quản lý quỹ đội bóng Ban Ban FC. Quét mã QR để chuyển quỹ.',
  openGraph: {
    title: 'Ban Ban FC - Quản Lý Quỹ',
    description: 'Quản lý quỹ đội bóng Ban Ban FC. Quét mã QR để chuyển quỹ.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Ban Ban FC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ban Ban FC - Quản Lý Quỹ',
    description: 'Quản lý quỹ đội bóng Ban Ban FC. Quét mã QR để chuyển quỹ.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
