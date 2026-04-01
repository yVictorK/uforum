'use client'
import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, Users, CheckCircle2 } from 'lucide-react'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { fmtDate, fmtNum } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Sk } from '@/components/ui/index'
import toast from 'react-hot-toast'

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated } = useAuthStore()
  const [busy, setBusy] = useState(false)

  const { data: event, isLoading, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id).then((r) => r.data),
  })

  const isPast = event ? new Date(event.startDate) < new Date() : false

  const attend = async () => {
    if (!isAuthenticated) { toast.error('Faça login'); return }
    if (isPast || busy || !event) return
    setBusy(true)
    try { await eventsApi.attend(event.id); refetch(); toast.success(event.isAttending ? 'Cancelado' : 'Presença confirmada! 🎉') }
    catch { toast.error('Erro') }
    finally { setBusy(false) }
  }

  if (isLoading) return (
    <div className="page-wrap py-6 max-w-3xl">
      <Sk className="h-6 w-24 mb-4" /><Sk className="h-64 rounded-2xl mb-6" />
      <div className="space-y-3"><Sk className="h-8 w-3/4" /><Sk className="h-4 w-full" /></div>
    </div>
  )
  if (!event) return <div className="page-wrap py-12 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Evento não encontrado</div>

  return (
    <div className="page-wrap py-6 max-w-3xl">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm mb-4 group" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Eventos
      </Link>

      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
      ) : (
        <div className="w-full h-48 rounded-2xl mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,196,79,0.1), rgba(0,196,79,0.04))', border: '1px solid rgba(0,196,79,0.15)' }}>
          <CalendarDays className="w-16 h-16" style={{ color: 'rgba(0,196,79,0.3)' }} />
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 space-y-5">
          {isPast && <span className="badge-zinc text-xs">Encerrado</span>}
          <h1 className="text-3xl font-black">{event.title}</h1>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{event.description}</p>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm">Detalhes</h3>
            {[
              { icon: CalendarDays, color: '#00c44f', label: 'Data', value: fmtDate(event.startDate) + (event.endDate ? ` — ${fmtDate(event.endDate)}` : '') },
              { icon: MapPin,       color: '#00c44f', label: 'Local', value: event.location },
              { icon: Users,       color: 'rgba(255,255,255,0.3)', label: 'Confirmados', value: `${fmtNum(event.attendeesCount)} pessoa${event.attendeesCount !== 1 ? 's' : ''}` },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div><p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p><p className="text-sm">{value}</p></div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Organizado por</p>
            <Link href={`/profile/${event.createdBy.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar src={event.createdBy.profilePictureUrl} name={event.createdBy.fullName} size="sm" />
              <span className="text-sm font-medium">{event.createdBy.fullName}</span>
            </Link>
          </div>
        </div>

        <div className="lg:w-56 flex-shrink-0">
          <div className="card p-5 sticky top-20 space-y-4" style={{ borderColor: event.isAttending ? 'rgba(0,196,79,0.2)' : 'rgba(255,255,255,0.07)' }}>
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: '#00c44f' }}>{event.attendeesCount}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>confirmados</div>
            </div>
            <button onClick={attend} disabled={busy || isPast}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${event.isAttending ? 'btn-outline' : isPast ? '' : 'btn-green'}`}
              style={isPast && !event.isAttending ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' } : event.isAttending ? {} : { boxShadow: '0 0 20px rgba(0,196,79,0.2)' }}>
              {busy ? '...' : event.isAttending ? <><CheckCircle2 className="w-4 h-4" />Vou!</> : isPast ? 'Encerrado' : 'Confirmar Presença'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
