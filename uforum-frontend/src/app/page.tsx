import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { VideoScrubSection } from '@/components/home/VideoScrubSection'
import { BentoGrid } from '@/components/home/BentoGrid'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass h-16 border-b border-zinc-800/50">
        <div className="page-wrap h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-emerald-400">
              <Logo size={24} />
            </div>
            <span className="font-bold text-lg tracking-tight font-sans text-zinc-100">UForum</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost">Login</Link>
            <Link href="/auth/register" className="btn-green py-2 px-5">Cadastrar</Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        <VideoScrubSection />
        <BentoGrid />
      </main>

      <Footer />
    </>
  )
}
