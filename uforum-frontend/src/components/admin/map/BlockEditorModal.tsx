'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Trash2, Layers, X, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { mapApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { MapBlock, Floor, Room, RoomType } from '@/types'

const FloorEditor = dynamic(() => import('@/components/admin/map/FloorEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
      <div className="w-6 h-6 border-2 border-[var(--emerald-500)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Carregando editor visual...</p>
    </div>
  ),
})

interface BlockEditorModalProps {
  coord: { lat: number, lng: number }
  block: MapBlock | null
  mode: 'CREATE' | 'EDIT'
  onClose: () => void
  onSaveCreate: (payload: any) => void
  onSaveUpdate: (payload: any) => void
  isSaving: boolean
  onDeleteBlock: () => void
}

interface BlockForm {
  name: string;
  code: string;
  description: string;
  floorCount: number;
  roomsPerFloor: number;
}

export function BlockEditorModal({ coord, block, mode, onClose, onSaveCreate, onSaveUpdate, isSaving, onDeleteBlock }: BlockEditorModalProps) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlockForm>()
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)
  
  const [containerSize, setContainerSize] = useState({ width: 600, height: 400 })
  
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

  useEffect(() => {
    if (block) {
      reset({
        name: block.name,
        code: block.code,
        description: block.description || '',
        floorCount: block.floorCount || 1,
        roomsPerFloor: 4 // default suggestion for edit, though it won't re-create unless explicitly handled if we wanted
      })
    } else {
      reset({ name: '', code: '', description: '', floorCount: 1, roomsPerFloor: 4 })
    }
  }, [block, reset])

  const [isReady, setIsReady] = useState(false)

  // Stabilize render after modal opening animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400)
    return () => clearTimeout(timer)
  }, [block?.id])


  const { data: floors = [] } = useQuery<Floor[]>({
    queryKey: ['floors', block?.id],
    queryFn: () => mapApi.getFloorsByBlock(block!.id).then((r) => r.data),
    enabled: mode === 'EDIT' && !!block,
  })

  useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0])
    }
  }, [floors, selectedFloor])

  const deleteRoom = useMutation({
    mutationFn: (id: string) => mapApi.deleteRoom(id),
    onSuccess: () => {
      toast.success('Sala excluída. O layout foi reajustado automaticamente.')
      qc.invalidateQueries({ queryKey: ['floors', block?.id] })
    },
    onError: () => toast.error('Erro ao excluir sala.'),
  })

  // We reuse Room creation/update logic, but now it acts to split or manually add if desired.
  // Although for this standard spec, we might just rely on auto-generation.
  const saveRoom = useMutation({
    mutationFn: (data: Partial<Room>) => {
      if (data.id) {
        return mapApi.updateRoom(data.id, data)
      } else {
        return mapApi.createRoom(data)
      }
    },
    onSuccess: () => {
      toast.success('Sala salva com sucesso.')
      qc.invalidateQueries({ queryKey: ['floors', block?.id] })
    },
    onError: () => toast.error('Erro ao salvar sala.'),
  })

  const handleRoomSave = (roomData: Partial<Room>) => {
    saveRoom.mutate(roomData)
  }

  const onSubmit = (data: BlockForm) => {
    const payload = {
      ...data,
      latitude: coord.lat,
      longitude: coord.lng,
      floorCount: Number(data.floorCount),
      roomsPerFloor: Number(data.roomsPerFloor)
    }
    if (mode === 'CREATE') {
      onSaveCreate(payload)
    } else {
      // Updates block directly. (Regenerating rooms requires a specific endpoint or is destructive)
      onSaveUpdate(payload)
    }
  }

  const currentFloorData = selectedFloor
    ? floors.find((f) => f.id === selectedFloor.id) || selectedFloor
    : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-4 lg:p-8 bg-black/40 backdrop-blur-sm">
      <div className="md:rounded-3xl w-[95vw] max-w-[1440px] h-full md:h-[80vh] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border-t md:border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
        
        {/* Left Panel: Form */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="p-5 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-md" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {mode === 'CREATE' ? 'Criar Novo Bloco' : 'Editar Bloco'}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="block-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5 flex-1">
            {mode === 'EDIT' && (
              <div className="flex justify-end mb-2">
                <button type="button" onClick={onDeleteBlock} className="px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Bloco Inteiro
                </button>
              </div>
            )}

            <div>
              <input
                {...register('name', { required: true })}
                placeholder="Ex: Instituto de Computação"
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-colors"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
              {errors.name && <span className="text-xs text-red-500 mt-1 block">Obrigatório</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  {...register('code', { required: true })}
                  placeholder="Ex: IC"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-colors"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                />
                {errors.code && <span className="text-xs text-red-500 mt-1 block">Obrigatório</span>}
              </div>
              <div>
                <input
                  type="number"
                  {...register('floorCount', { required: true, min: 1 })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-colors"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {mode === 'CREATE' && (
              <div>
                <label className="block text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5">Salas por Andar (Geração Automática)</label>
                <input
                  type="number"
                  {...register('roomsPerFloor', { min: 0 })}
                  defaultValue={4}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  O sistema irá dividir perfeitamente a área em fatias horizontais rígidas. Se uma for excluída, o restante ocupa o espaço automaticamente.
                </p>
              </div>
            )}

            <div>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Ex: Entrada lateral..."
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-colors resize-none"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <p className="text-[10px] border px-3 py-2 rounded-lg font-mono break-all" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
              Coord: {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
            </p>
          </form>

          <div className="p-5 border-t mt-auto sticky bottom-0 z-10 w-full" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <button 
              type="submit" 
              form="block-form"
              disabled={isSaving} 
              className="w-full btn-green py-3 text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? 'Salvando...' : (mode === 'CREATE' ? 'Criar Bloco e Gerar Salas' : 'Salvar Alterações')}
            </button>
          </div>
        </div>

        {/* Right Panel: Visualization & Konva */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-primary)' }}>
          {mode === 'CREATE' ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--bg-primary)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--bg-secondary)' }}>
                <Layers className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Preview Indisponível</h3>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Após preencher os dados e clicar em "Criar", as matrizes de layout das salas e andares serão geradas para visualização neste espaço.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Floor Tabs (Restored to Top) */}
              <div className="h-14 border-b flex items-center px-4 overflow-x-auto gap-2 flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                {floors.length === 0 ? (
                  <span className="text-sm italic" style={{ color: 'var(--text-muted)' }}>Nenhum andar encontrado.</span>
                ) : (
                  floors.map(floor => (
                    <button
                      key={floor.id}
                      onClick={() => setSelectedFloor(floor)}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border outline-none',
                        selectedFloor?.id === floor.id ? 'shadow-lg' : 'hover:bg-[var(--bg-tertiary)]'
                      )}
                      style={{
                        backgroundColor: selectedFloor?.id === floor.id ? 'var(--emerald-500)' : 'transparent',
                        borderColor: selectedFloor?.id === floor.id ? 'var(--emerald-500)' : 'var(--border-primary)',
                        color: selectedFloor?.id === floor.id ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      {floor.name || `${floor.number}º Andar`}
                    </button>
                  ))
                )}
              </div>

              {/* Map/Konva Area */}
              <div className="flex-1 flex flex-col min-h-0 relative p-6" ref={containerRef}>
                {isReady && currentFloorData ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <FloorEditor
                      floor={currentFloorData}
                      rooms={currentFloorData.rooms || []}
                      onSaveRoom={handleRoomSave}
                      onDeleteRoom={(id) => deleteRoom.mutate(id)}
                      width={containerSize.width}
                      height={containerSize.height}
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-zinc-500 text-sm">
                    {isReady ? 'Selecione um andar acima para visualizar.' : 'Carregando interface...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
