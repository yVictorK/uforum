'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useMapStore } from '@/store/map'
import type { Floor, Room, MapBlock } from '@/types'
import { MapPin, X, Info } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { mapApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const FloorRenderer = dynamic(() => import('./FloorRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Sala de Aula',
  LAB: 'Laboratório',
  ADMIN: 'Administrativo',
  OTHER: 'Outro',
}

export default function BuildingView() {
  const {
    selectedBlock,
    selectedFloor,
    setSelectedFloor,
    buildingViewOpen,
    setBuildingViewOpen,
    highlightedRoomId,
    setHighlightedRoomId,
  } = useMapStore()
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { data: floors = [] } = useQuery<Floor[]>({
    queryKey: ['floors', selectedBlock?.id],
    queryFn: async () => {
      const res = await mapApi.getFloorsByBlock(selectedBlock!.id)
      return res.data
    },
    enabled: !!selectedBlock && buildingViewOpen,
  })

  const { data: allBlocks = [] } = useQuery<MapBlock[]>({
    queryKey: ['map-blocks'],
    queryFn: async () => {
      const res = await mapApi.listBlocks()
      return res.data
    },
    enabled: buildingViewOpen,
  })

  useEffect(() => {
    if (floors.length === 0) return
    if (highlightedRoomId) {
      const targetFloor = floors.find((f) =>
        f.rooms?.some((r) => r.id === highlightedRoomId)
      )
      if (targetFloor) {
        setSelectedFloor(targetFloor)
        return
      }
    }
    if (!selectedFloor || !floors.find((f) => f.id === selectedFloor.id)) {
      setSelectedFloor(floors[0])
    }
  }, [floors, highlightedRoomId, selectedFloor, setSelectedFloor])

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      })
      resizeObserver.observe(node)
      setContainerSize({
        width: node.clientWidth,
        height: node.clientHeight,
      })
      return () => resizeObserver.disconnect()
    }
  }, [])

  const handleClose = () => {
    setBuildingViewOpen(false)
    setSelectedRoom(null)
    setHighlightedRoomId(null)
    setIsReady(false)
  }

  if (!selectedBlock || !buildingViewOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/15 backdrop-blur-[2px] p-0 md:p-4 lg:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onAnimationComplete={() => setIsReady(true)}
        className="w-[98vw] h-[90vh] md:h-[85vh] max-w-[1600px] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border backdrop-blur-xl"
        style={{ background: 'var(--bg-primary-90)', borderColor: 'var(--border-primary)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--emerald-500)]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--emerald-500)]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{selectedBlock.name}</h2>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--text-muted)' }}>{selectedBlock.code} • {floors.length} andar{floors.length !== 1 ? 'es' : ''}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-xl transition-all hover:bg-[var(--bg-tertiary)] active:scale-95"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Floor Selector Sidebar & Mobile Bar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r p-3 md:p-5 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto flex-shrink-0 no-scrollbar"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>

            <h3 className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50" style={{ color: 'var(--text-primary)' }}>Andares</h3>

            {floors.length === 0 ? (
              <p className="text-xs italic px-2" style={{ color: 'var(--text-muted)' }}>Nenhum andar cadastrado</p>
            ) : (
              floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => {
                    setSelectedFloor(floor)
                    setSelectedRoom(null)
                    setHighlightedRoomId(null)
                  }}
                  className={cn(
                    'flex flex-shrink-0 items-center gap-3 p-2.5 md:p-3 rounded-2xl transition-all border outline-none',
                    selectedFloor?.id === floor.id
                      ? 'shadow-xl shadow-emerald-500/10 md:translate-x-1'
                      : 'border-transparent hover:bg-[var(--bg-tertiary)]'
                  )}
                  style={{
                    backgroundColor: selectedFloor?.id === floor.id ? 'var(--emerald-500)' : 'transparent',
                    borderColor: selectedFloor?.id === floor.id ? 'var(--emerald-500)' : 'transparent',
                    color: selectedFloor?.id === floor.id ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  aria-label={`Andar ${floor.number}: ${floor.name || ''}`}
                  aria-pressed={selectedFloor?.id === floor.id}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                    style={{ background: selectedFloor?.id === floor.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)' }}>
                    {floor.number}
                  </div>
                  <span className="text-sm font-bold truncate pr-2">{floor.name || `Andar ${floor.number}`}</span>
                </button>
              ))
            )}

            {selectedRoom && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Sala Selecionada</h3>
                <div className="rounded-xl p-3 space-y-2 border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedRoom.name}</p>
                  {selectedRoom.number && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nº {selectedRoom.number}</p>}
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      {ROOM_TYPE_LABELS[selectedRoom.type] || selectedRoom.type}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative p-6 lg:p-8 flex items-center justify-center min-h-0" ref={containerRef}>
            <AnimatePresence mode="wait">
              {isReady && selectedFloor && containerSize.width > 0 ? (
                <motion.div
                  key={selectedFloor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="absolute inset-0 overflow-hidden rounded-2xl"
                >
                  <FloorRenderer
                    rooms={selectedFloor.rooms || []}
                    selectedRoomId={highlightedRoomId}
                    allBlocks={allBlocks}
                    currentBlock={selectedBlock}
                    onRoomClick={(room) => {
                      setSelectedRoom(room)
                      setHighlightedRoomId(room.id)
                    }}
                    width={containerSize.width}
                    height={containerSize.height}
                  />
                </motion.div>
              ) : (
                <div className="text-zinc-500 text-xs italic">Carregando visualização...</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
