'use client'
import Link from 'next/link'
import { useState } from 'react'
import { CalendarDays, MapPin, Users, CheckCircle2 } from 'lucide-react'
import { cn, fmtDate, fmtNum } from '@/lib/utils'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Event } from '@/types'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export function EventCard({ event: init, onUpdate }: { event: Event; onUpdate?: (e: Event) => void }) {
  const { isAuthenticated } = useAuthStore()
  const [e, setE] = useState(init)
  const [busy, setBusy] = useState(false)
  const isPast = new Date(e.startDate) < new Date()

  const attend = async () => {
    if (!isAuthenticated) { toast.error('Faça login'); return }
    if (isPast || busy) return
    setBusy(true)
    try {
      const { data } = await eventsApi.attend(e.id)
      setE(data); onUpdate?.(data)
      toast.success(data.isAttending ? 'Presença confirmada! 🎉' : 'Presença cancelada')
    } catch { toast.error('Erro') }
    finally { setBusy(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden group hover:bg-[var(--bg-secondary)] hover:border-[var(--emerald-500)]/20 transition-all duration-200">
      <div className="relative h-36 overflow-hidden">
        {e.imageUrl ? (
          <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
            <CalendarDays className="w-10 h-10" style={{ color: 'var(--emerald-500)', opacity: 0.2 }} />
          </div>
        )}
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
            <span className="badge-zinc text-xs">Encerrado</span>
          </div>
        )}
        {e.isAttending && !isPast && (
          <div className="absolute top-2.5 right-2.5">
            <span className="badge-green text-xs"><CheckCircle2 className="w-3 h-3" />Confirmado</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <Link href={`/events/${e.id}`}>
            <h3 className="font-bold text-sm leading-snug hover:text-[var(--emerald-500)] transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>{e.title}</h3>
          </Link>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{e.description}</p>
        </div>

        <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--emerald-500)' }} />
            <span>{fmtDate(e.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--emerald-500)' }} />
            <span className="line-clamp-1">{e.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{fmtNum(e.attendeesCount)} confirmados</span>
          </div>
        </div>

        <button onClick={attend} disabled={busy || isPast}
          className={cn('w-full py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
            e.isAttending ? 'btn-outline' : isPast ? '' : 'btn-green'
          )}
          style={isPast && !e.isAttending ? { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' } : {}}>
          {busy ? '...' : e.isAttending ? 'Cancelar presença' : isPast ? 'Encerrado' : 'Confirmar Presença'}
        </button>
      </div>
    </motion.div>
  )
}
