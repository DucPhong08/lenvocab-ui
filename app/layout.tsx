import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700', '800'], variable: '--font-vietnam' })

export const metadata: Metadata = {
  title: 'Lenvocab — Học tiếng Anh từ thế giới quanh bạn',
  description: 'Biến những điều bạn nhìn thấy mỗi ngày thành từ vựng tiếng Anh đáng nhớ. Khám phá bản demo Lenvocab.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#173d32',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
