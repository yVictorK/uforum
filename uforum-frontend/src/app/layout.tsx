import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const geistMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'UForum', template: '%s · UForum' },
  description: 'A rede social da Universidade Federal do Amazonas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${outfit.variable} ${geistMono.variable} font-sans antialiased min-h-[100dvh] bg-zinc-950 text-zinc-100 overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
