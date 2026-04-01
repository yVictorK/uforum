import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-dm-mono', weight: ['400', '500'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'UForum', template: '%s · UForum' },
  description: 'A rede social da Universidade Federal do Amazonas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`} style={{ background: '#0d0d0d', color: '#f0f0f0' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
