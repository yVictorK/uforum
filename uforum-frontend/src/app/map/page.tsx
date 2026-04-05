'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, X, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { mapApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { MapBlock } from '@/types'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ background: '#161616' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#00c44f', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando mapa...</p>
      </div>
    </div>
  )
})

export default function MapPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<MapBlock | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const { user } = useAuthStore()

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['map-blocks', q],
    queryFn: () => mapApi.listBlocks(q || undefined).then((r) => r.data),
  })

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => { }
    )
  }, [])

  return (
    <div className="page-wrap py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Mapa do Campus</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Encontre qualquer bloco da UFAM</p>
        </div>

        {user?.role === 'ADMIN' && (
          <Link href="/admin/map" className="btn-green text-sm px-4 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Configurar Mapa
          </Link>
        )}
      </div>

      <div className="flex gap-4 h-[580px]">
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 hidden md:flex">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar bloco..." className="input pl-10" />
          </div>

          {userPos && (
            <div className="card p-3 flex items-center gap-2 text-sm" style={{ borderColor: 'var(--emerald-500)/20' }}>
              <Navigation className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--emerald-500)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Localização detectada</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
            ) : (blocks as MapBlock[]).map((b) => (
              <button key={b.id} onClick={() => setSelected(b)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border',
                  selected?.id === b.id ? 'bg-[var(--emerald-500)]/10 border-[var(--emerald-500)]/30' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
                )}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: selected?.id === b.id ? 'var(--emerald-500)' : 'var(--bg-tertiary)' }}>
                  <MapPin className="w-4 h-4" style={{ color: selected?.id === b.id ? '#fff' : 'var(--text-muted)' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{b.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.code} · {b.floorCount} andar{b.floorCount !== 1 ? 'es' : ''}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
          <LeafletMap blocks={blocks as MapBlock[]} selected={selected} userPos={userPos} onSelect={setSelected} />

          {selected && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-[1000] card p-4 shadow-2xl"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--emerald-500)/30' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{selected.code} · {selected.floorCount} andares</p>
                  {selected.description && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="btn-ghost p-1 flex-shrink-0"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
