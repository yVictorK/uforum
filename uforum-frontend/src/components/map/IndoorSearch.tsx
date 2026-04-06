'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Search, Building2, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Room, Floor } from '@/types'
import { useMapStore } from '@/store/map'
import { mapApi } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Sala de Aula',
  LAB: 'Laboratório',
  ADMIN: 'Administrativo',
  OTHER: 'Outro',
}

export default function IndoorSearch() {
  const [q, setQ] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { navigateToRoom } = useMapStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results = [], isLoading } = useQuery<Room[]>({
    queryKey: ['room-search', q],
    queryFn: async () => {
      if (!q || q.length < 2) return []
      const res = await mapApi.searchRooms(q)
      return res.data
    },
    enabled: q.length >= 2,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectRoom = async (room: Room) => {
    try {
      const [floorsRes, blockRes] = await Promise.all([
        mapApi.getFloorsByBlock(room.blockId),
        mapApi.getBlock(room.blockId),
      ])

      const floor = floorsRes.data.find((f: Floor) => f.id === room.floorId)
      if (!floor) return

      navigateToRoom(room, floor, blockRes.data)
      setIsOpen(false)
      setQ('')
    } catch (err) {
      console.error('Erro ao navegar para sala:', err)
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar sala, laboratório ou bloco..."
          className="w-full rounded-xl py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:border-[var(--emerald-500)]/50 focus:ring-4 focus:ring-[var(--emerald-500)]/10"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          aria-label="Buscar salas no campus"
          role="combobox"
          aria-expanded={isOpen && q.length >= 2}
        />
        {q && (
          <button
            onClick={() => { setQ(''); setIsOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
            aria-label="Limpar busca"
          >
            <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && q.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-[2000] max-h-[400px] overflow-y-auto border"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
            role="listbox"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-[var(--emerald-500)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Buscando no campus...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group hover:bg-[var(--bg-secondary)]"
                    role="option"
                    aria-label={`${room.name} - ${ROOM_TYPE_LABELS[room.type] || room.type}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      style={{ background: 'var(--bg-secondary)' }}>
                      <Building2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{room.name}</p>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {room.number && `${room.number} • `}
                        {room.blockCode || ''}{room.floorNumber !== undefined ? ` · ${room.floorNumber}º andar` : ''} • {ROOM_TYPE_LABELS[room.type] || room.type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum local encontrado para &ldquo;{q}&rdquo;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
