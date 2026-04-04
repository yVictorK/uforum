'use client'
import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, Users, CheckCircle2, MoreVertical, Edit3, Trash2 } from 'lucide-react'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { fmtDate, fmtNum } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Sk } from '@/components/ui/index'
import toast from 'react-hot-toast'
import { CreateEventModal } from '@/components/event/CreateEventModal'
import { AnimatePresence, motion } from 'framer-motion'

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [busy, setBusy] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

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

  const qr = useQueryClient()

  const { mutate: deleteEvent } = useMutation({
    mutationFn: () => eventsApi.delete(id),
    onSuccess: () => {
      toast.success('Evento excluído.')
      qr.invalidateQueries({ queryKey: ['events'] })
      router.push('/events')
    },
    onError: () => toast.error('Erro ao excluir evento.')
  })

  // Role verification
  const canEdit = user && (user.role === 'ADMIN' || user.role === 'EVENT_MANAGER' || (event && event.createdBy.id === user.id))

  if (isLoading) return (
    <div className="page-wrap py-6 max-w-3xl">
      <Sk className="h-6 w-24 mb-4" /><Sk className="h-64 rounded-2xl mb-6" />
      <div className="space-y-3"><Sk className="h-8 w-3/4" /><Sk className="h-4 w-full" /></div>
    </div>
  )
  if (!event) return <div className="page-wrap py-12 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Evento não encontrado</div>

  return (
    <div className="page-wrap py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm group" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Eventos
        </Link>
        
        {canEdit && (
          <div className="relative">
            <button onClick={() => setShowAdminMenu(!showAdminMenu)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showAdminMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAdminMenu(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl z-20 overflow-hidden py-1">
                    <button onClick={() => { setShowAdminMenu(false); setShowEditModal(true) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-sm text-zinc-300">
                      <Edit3 className="w-4 h-4" /> Editar Evento
                    </button>
                    <button onClick={() => { if(window.confirm('Tem certeza?')) deleteEvent() }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 text-rose-400 text-sm">
                      <Trash2 className="w-4 h-4" /> Excluir Evento
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

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

      {canEdit && showEditModal && (
        <CreateEventModal 
          open={showEditModal} 
          onClose={() => setShowEditModal(false)}
          onSuccess={() => refetch()}
          initialData={event}
        />
      )}
    </div>
  )
}
