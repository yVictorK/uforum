import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { ArrowRight, Hash, CalendarDays, ShoppingBag, Map, Users, Shield } from 'lucide-react'

export default function HomePage() {
  const features = [
    { icon: Hash, title: 'Fóruns & Comunidades', desc: 'Discuta qualquer tema em comunidades do seu curso ou interesse.' },
    { icon: CalendarDays, title: 'Eventos do Campus', desc: 'Confirme presença em eventos e nunca perca nada importante.' },
    { icon: ShoppingBag, title: 'Marketplace UFAM', desc: 'Compre e venda entre estudantes — de bolos a notebooks.' },
    { icon: Map, title: 'Mapa Interativo', desc: 'Encontre qualquer bloco do campus com mapa offline.' },
    { icon: Users, title: 'Rede Universitária', desc: 'Siga colegas, professores e construa sua rede acadêmica.' },
    { icon: Shield, title: 'Só para UFAM', desc: 'Acesso exclusivo com email @ufam.edu.br e matrícula.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b h-14" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="page-wrap h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-bold text-base tracking-tight">UForum</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm py-1.5">Entrar</Link>
            <Link href="/auth/register" className="btn-green text-sm py-1.5 px-4">Cadastrar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* BG effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #00c44f 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,196,79,0.3), transparent)' }} />
        </div>

        <div className="page-wrap text-center max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(0,196,79,0.08)', border: '1px solid rgba(0,196,79,0.2)', color: '#00c44f' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00c44f' }} />
            Exclusivo para a comunidade UFAM
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-6">
            A rede social da<br />
            <span style={{ color: '#00c44f' }}>UFAM</span>
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Conecte-se com colegas, discuta em comunidades, acompanhe eventos e explore o campus — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-green text-base py-3.5 px-8"
              style={{ boxShadow: '0 0 32px rgba(0,196,79,0.3)' }}>
              Criar conta grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/feed" className="btn-outline text-base py-3.5 px-8">
              Explorar o feed
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-sm mx-auto">
            {[['10+', 'Comunidades'], ['∞', 'Posts'], ['100%', 'UFAM']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-black" style={{ color: '#00c44f' }}>{v}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="page-wrap">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3">Tudo que você precisa</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Uma plataforma completa para a vida universitária</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:bg-[#1a1a1a] hover:border-[rgba(0,196,79,0.2)] transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110"
                  style={{ background: 'rgba(0,196,79,0.1)', border: '1px solid rgba(0,196,79,0.15)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#00c44f' }} />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="page-wrap">
          <div className="rounded-2xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,196,79,0.08) 0%, rgba(0,196,79,0.03) 100%)', border: '1px solid rgba(0,196,79,0.15)' }}>
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at center, rgba(0,196,79,0.15) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Faça parte da comunidade</h2>
              <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Cadastre-se com seu email @ufam.edu.br e matrícula.
              </p>
              <Link href="/auth/register" className="btn-green text-base py-3.5 px-8 inline-flex"
                style={{ boxShadow: '0 0 32px rgba(0,196,79,0.3)' }}>
                Começar agora <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t text-center text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
        © 2024 UForum — UFAM · Feito com ❤️ para a comunidade universitária
      </footer>
    </div>
  )
}
