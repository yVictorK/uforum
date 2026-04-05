'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, Flag, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Usuários', href: '/admin/users', icon: Users },
  { label: 'Denúncias', href: '/admin/reports', icon: Flag },
  { label: 'Mapa', href: '/admin/map', icon: MapPin },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Shield className="w-8 h-8 text-[var(--emerald-500)]" />
          Painel de Administração
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gerenciamento de usuários, moderação e mapa do campus.</p>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                active ? "bg-[var(--emerald-500)] text-white shadow-lg shadow-emerald-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", active ? "text-white" : "text-[var(--text-muted)]")} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
