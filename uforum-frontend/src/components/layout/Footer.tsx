"use client"
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { InstagramLogo, TwitterLogo, LinkedinLogo, GithubLogo } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800/50 pt-20 pb-12 overflow-hidden relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="page-wrap grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-emerald-400">
              <Logo size={24} />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">UForum</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
            Ecossistema web elegante focando em comunicação e colaborações contínuas para o Câmpus da UFAM.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Plataforma</h4>
          <ul className="space-y-3 test-sm font-medium text-zinc-400">
            <li><Link href="/feed" className="hover:text-emerald-400 transition-colors">Feed Global</Link></li>
            <li><Link href="/communities" className="hover:text-emerald-400 transition-colors">Comunidades</Link></li>
            <li><Link href="/events" className="hover:text-emerald-400 transition-colors">Eventos do Câmpus</Link></li>
            <li><Link href="/marketplace" className="hover:text-emerald-400 transition-colors">Marketplace Acadêmico</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Legal & Suporte</h4>
          <ul className="space-y-3 test-sm font-medium text-zinc-400">
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Diretrizes da Comunidade</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Centro de Ajuda</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Social</h4>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
              <InstagramLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
              <TwitterLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
              <LinkedinLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
              <GithubLogo size={20} weight="duotone" />
            </Link>
          </div>
        </div>
      </div>

      <div className="page-wrap flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-800/50 relative z-10">
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-4 md:mb-0">
          © {new Date().getFullYear()} UForum — Sistema Exclusivo UFAM
        </p>
        <div className="flex items-center gap-2 inline-flex text-xs font-mono text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald"></span>
          Todos os sistemas normais
        </div>
      </div>
    </footer>
  )
}
