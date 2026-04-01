'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Users, Lock } from 'lucide-react'
import { cn, fmtNum } from '@/lib/utils'
import { communitiesApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Community } from '@/types'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export function CommunityCard({ community: init, onUpdate }: { community: Community; onUpdate?: (c: Community) => void }) {
  const { isAuthenticated } = useAuthStore()
  const [c, setC] = useState(init)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (!isAuthenticated) { toast.error('Faça login'); return }
    if (busy) return
    setBusy(true)
    try {
      if (c.isMember) {
        await communitiesApi.leave(c.slug)
        const u = { ...c, isMember: false, memberCount: c.memberCount - 1 }
        setC(u); onUpdate?.(u); toast.success(`Saiu de ${c.name}`)
      } else {
        const { data } = await communitiesApi.join(c.slug)
        setC(data); onUpdate?.(data); toast.success(`Entrou em ${c.name}!`)
      }
    } catch { toast.error('Erro') }
    finally { setBusy(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="card p-4 hover:bg-[#1a1a1a] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200">
      <div className="flex items-center gap-3">
        <Link href={`/communities/${c.slug}`} className="flex-shrink-0">
          {c.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.iconUrl} alt={c.name} className="w-11 h-11 rounded-xl object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base"
              style={{ background: 'rgba(0,196,79,0.1)', border: '1px solid rgba(0,196,79,0.2)', color: '#00c44f' }}>
              {c.name[0].toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/communities/${c.slug}`}
            className="font-semibold text-sm hover:text-[#00c44f] transition-colors flex items-center gap-1.5 truncate">
            {c.name} {c.isPrivate && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
          </Link>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-3 h-3" />{fmtNum(c.memberCount)} membros
          </p>
          <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
        </div>
        <button onClick={toggle} disabled={busy}
          className={cn('flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50',
            c.isMember ? 'btn-outline' : 'btn-green text-xs py-1.5 px-4')}>
          {busy ? '...' : c.isMember ? 'Seguindo' : 'Seguir'}
        </button>
      </div>
    </motion.div>
  )
}
