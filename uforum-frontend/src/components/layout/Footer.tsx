"use client"
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { InstagramLogo, TwitterLogo, LinkedinLogo, GithubLogo } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="w-full border-t pt-20 pb-12 overflow-hidden relative" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="page-wrap grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-emerald-500">
              <Logo size={24} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>UForum</span>
          </div>
          <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: 'var(--text-muted)' }}>
            Ecossistema web elegante focando em comunicação e colaborações contínuas para o Câmpus da UFAM.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Plataforma</h4>
          <ul className="space-y-3 test-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <li><Link href="/feed" className="hover:text-emerald-500 transition-colors">Feed Global</Link></li>
            <li><Link href="/communities" className="hover:text-emerald-500 transition-colors">Comunidades</Link></li>
            <li><Link href="/events" className="hover:text-emerald-500 transition-colors">Eventos do Câmpus</Link></li>
            <li><Link href="/marketplace" className="hover:text-emerald-500 transition-colors">Marketplace Acadêmico</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Legal & Suporte</h4>
          <ul className="space-y-3 test-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Termos de Uso</Link></li>
            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Política de Privacidade</Link></li>
            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Diretrizes da Comunidade</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Centro de Ajuda</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Social</h4>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <InstagramLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <TwitterLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <LinkedinLogo size={20} weight="duotone" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <GithubLogo size={20} weight="duotone" />
            </Link>
          </div>
        </div>
      </div>

      <div className="page-wrap flex flex-col md:flex-row items-center justify-between pt-8 border-t relative z-10" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="text-xs font-mono uppercase tracking-widest mb-4 md:mb-0" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} UForum — Sistema Exclusivo UFAM
        </p>
        <div className="flex items-center gap-2 inline-flex text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }}></span>
          Todos os sistemas normais
        </div>
      </div>
    </footer>
  )
}
