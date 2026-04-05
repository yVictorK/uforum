'use client'
import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CalendarDays, Plus } from 'lucide-react'
import { EventCard } from '@/components/event/EventCard'
import { CreateEventModal } from '@/components/event/CreateEventModal'
import { Empty, Sk } from '@/components/ui/index'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Event, Page } from '@/types'

export default function EventsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['events'],
    queryFn: ({ pageParam = 0 }) => eventsApi.list(pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Event>) => last.last ? undefined : last.number + 1,
  })
  const events = data?.pages.flatMap((p) => p.content) ?? []
  const { user } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const canCreate = user?.role === 'ADMIN' || user?.role === 'EVENT_MANAGER'

  return (
    <div className="page-wrap pt-5 pb-6 sm:py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black">Eventos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Próximos eventos do campus</p>
        </div>
        {canCreate && (
          <button onClick={() => setIsModalOpen(true)} className="btn-green flex items-center gap-2 py-2 px-4 text-sm font-medium">
            <Plus className="w-4 h-4" /> Cadastrar Evento
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Sk className="h-36 rounded-none" /><div className="p-4 space-y-2"><Sk className="h-4 w-3/4" /><Sk className="h-8 rounded-xl" /></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Empty icon={CalendarDays} title="Nenhum evento próximo" description="Fique de olho!" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-outline w-full justify-center py-3 mt-4">
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </>
      )}

      <CreateEventModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
