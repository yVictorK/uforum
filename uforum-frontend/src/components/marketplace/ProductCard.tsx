'use client'
import Link from 'next/link'
import { MessageCircle, Package } from 'lucide-react'
import { fmtPrice, statusLabel, whatsappUrl, timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { Product } from '@/types'
import { motion } from 'framer-motion'

interface Props {
  product: Product
  compact?: boolean
}

export function ProductCard({ product: p, compact = false }: Props) {
  const img = p.imageUrls?.[0]
  const isAvail = p.status === 'AVAILABLE'

  const handleWA = (ev: React.MouseEvent) => {
    ev.preventDefault()
    if (!p.sellerWhatsapp) return
    const msg = `Olá! Vi seu anúncio no UForum: "${p.title}". Ainda disponível?`
    window.open(whatsappUrl(p.sellerWhatsapp, msg), '_blank')
  }

  const statusColors: Record<string, string> = {
    AVAILABLE: 'badge-green',
    RESERVED: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    SOLD: 'badge-zinc line-through',
  }

  if (compact) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="card overflow-hidden hover:bg-[var(--bg-secondary)] hover:border-[var(--emerald-500)]/20 transition-all duration-200 h-full">
        <div className="h-28 overflow-hidden relative bg-[var(--bg-secondary)]">
          {img ? (
            <img src={img} alt={p.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5">
            <span className={`badge text-[10px] ${statusColors[p.status]}`}>{statusLabel(p.status)}</span>
          </div>
        </div>
        <div className="p-2.5">
          <p className="font-semibold text-xs line-clamp-2 leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
          <p className="font-black text-sm" style={{ color: 'var(--emerald-500)' }}>{fmtPrice(p.price)}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden group hover:bg-[var(--bg-secondary)] hover:border-[var(--emerald-500)]/20 transition-all duration-200 flex flex-col">
      <div className="h-44 overflow-hidden relative bg-[var(--bg-secondary)]">
        {img ? (
          <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12" style={{ color: 'rgba(255,255,255,0.1)' }} />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className={`badge text-xs ${statusColors[p.status]}`}>{statusLabel(p.status)}</span>
        </div>
        {p.imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
            +{p.imageUrls.length - 1}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
          {p.category && <span className="text-xs mt-0.5 block font-medium" style={{ color: 'var(--emerald-500)' }}>{p.category}</span>}
        </div>

        <p className="text-xl font-black" style={{ color: 'var(--emerald-500)' }}>{fmtPrice(p.price)}</p>

        <div className="flex items-center gap-2 pt-2 mt-auto border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <Link href={`/profile/${p.seller.username}`} className="flex items-center gap-1.5 flex-1 min-w-0">
            <Avatar src={p.seller.profilePictureUrl} name={p.seller.fullName} size="xs" />
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.seller.fullName}</span>
          </Link>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(p.createdAt)}</span>
        </div>

        {p.sellerWhatsapp && isAvail && (
          <button onClick={handleWA}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,211,102,0.22)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)' }}>
            <MessageCircle className="w-4 h-4" />WhatsApp
          </button>
        )}
      </div>
    </motion.div>
  )
}
