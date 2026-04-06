'use client'
import React, { useState, useRef, useMemo } from 'react'
import { Stage, Layer, Rect, Group, Text, Line } from 'react-konva'
import { X, RotateCcw } from 'lucide-react'
import type { Room, Floor, RoomType } from '@/types'
import { useTheme } from '@/components/providers/ThemeProvider'
import Konva from 'konva'

interface FloorEditorProps {
  floor: Floor
  rooms: Room[]
  onSaveRoom: (room: Partial<Room>) => void
  onDeleteRoom: (id: string) => void
  width: number
  height: number
}

const GridBackground = ({ width, height }: any) => {
  const gridSize = 40
  const lines: React.ReactNode[] = []
  for (let i = 0; i < width / gridSize + 2; i++) {
    lines.push(<Line key={`v-${i}`} points={[i * gridSize, 0, i * gridSize, height]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} listening={false} />)
  }
  for (let j = 0; j < height / gridSize + 2; j++) {
    lines.push(<Line key={`h-${j}`} points={[0, j * gridSize, width, j * gridSize]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} listening={false} />)
  }
  return <Group listening={false}>{lines}</Group>
}

export default function FloorEditor({ floor, rooms, onSaveRoom, onDeleteRoom, width, height }: FloorEditorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const stageRef = useRef<Konva.Stage>(null)
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [editingRoom, setEditingRoom] = useState<{ name: string; number: string; type: RoomType } | null>(null)

  const padding = 60
  const effectiveWidth = Math.max(1, width - padding * 2)
  const effectiveHeight = Math.max(1, height - padding * 2)

  const bounds = useMemo(() => {
    if (rooms.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100, contentWidth: 100, contentHeight: 100 }
    const minX = Math.min(...rooms.map(r => r.x))
    const minY = Math.min(...rooms.map(r => r.y))
    const maxX = Math.max(...rooms.map(r => r.x + r.width))
    const maxY = Math.max(...rooms.map(r => r.y + r.height))
    return { minX, minY, maxX, maxY, contentWidth: maxX - minX, contentHeight: maxY - minY }
  }, [rooms])

  const initialScale = useMemo(() => {
    const w = Math.floor(width)
    const h = Math.floor(height)
    if (w < 50 || h < 50) return 1
    const sX = (w - 40) / bounds.contentWidth
    const sY = (h - 40) / bounds.contentHeight
    return Math.min(sX, sY) * 1.4 // Senior Refinement: 1.4x scale
  }, [width, height, bounds])

  const initialPosition = useMemo(() => {
    const w = Math.floor(width)
    const h = Math.floor(height)
    if (w < 50 || h < 50) return { x: 0, y: 0 }
    return {
      x: w / 2 - initialScale * (bounds.minX + bounds.contentWidth / 2),
      y: h / 2 - initialScale * (bounds.minY + bounds.contentHeight / 2)
    }
  }, [width, height, bounds, initialScale])

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale }
    const newScale = e.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1
    if (newScale < 0.1 || newScale > 10) return
    stage.scale({ x: newScale, y: newScale })
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale })
    stage.batchDraw()
  }

  const resetView = () => {
    if (stageRef.current) {
      stageRef.current.scale({ x: initialScale, y: initialScale })
      stageRef.current.position({ x: initialPosition.x, y: initialPosition.y })
      stageRef.current.batchDraw()
    }
  }

  const handleSaveEdit = () => {
    if (selectedRoom && editingRoom) {
      onSaveRoom({ id: selectedRoom.id, ...editingRoom })
      setSelectedRoom(null)
      setEditingRoom(null)
    }
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border relative group" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
        Editor Ativo • Arraste para mover • Scroll para Zoom
      </div>

      <div className="absolute bottom-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={resetView} className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-xl hover:scale-105 active:scale-95 transition-all text-[var(--text-primary)]">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {selectedRoom && (
        <div className="absolute top-4 right-4 z-10 w-64 border rounded-2xl p-5 shadow-2xl flex flex-col gap-4 backdrop-blur-xl" 
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
           
           <div className="flex items-center justify-between mb-1">
             <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Editar Sala</div>
             <button onClick={() => { setSelectedRoom(null); setEditingRoom(null); }} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
               <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
             </button>
           </div>

           <div>
             <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50" style={{ color: 'var(--text-primary)' }}>Nome</label>
             <input 
               value={editingRoom?.name || selectedRoom.name} 
                onChange={(e) => setEditingRoom(prev => ({ ...(prev || { name: selectedRoom.name, number: selectedRoom.number || '', type: selectedRoom.type }), name: e.target.value }))}
               className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-all" 
               style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
               placeholder="Nome da sala"
             />
           </div>

           <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50" style={{ color: 'var(--text-primary)' }}>Número</label>
               <input 
                 value={editingRoom?.number || selectedRoom.number || ''} 
                 onChange={(e) => setEditingRoom(prev => ({ ...(prev || { name: selectedRoom.name, number: selectedRoom.number || '', type: selectedRoom.type }), number: e.target.value }))}
                 className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-all text-center" 
                 style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                 placeholder="000"
               />
             </div>
             <div>
               <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50" style={{ color: 'var(--text-primary)' }}>Tipo</label>
               <select 
                 value={editingRoom?.type || selectedRoom.type} 
                 onChange={(e) => setEditingRoom(prev => ({ ...(prev || { name: selectedRoom.name, number: selectedRoom.number || '', type: selectedRoom.type }), type: e.target.value as RoomType }))}
                 className="w-full rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-[var(--emerald-500)] transition-all"
                 style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
               >
                 <option value="CLASSROOM">Aula</option>
                 <option value="LAB">Laborat.</option>
                 <option value="ADMIN">Admin.</option>
                 <option value="OTHER">Outro</option>
               </select>
             </div>
           </div>

           <div className="flex gap-2 mt-2">
             <button onClick={handleSaveEdit} className="flex-1 btn-green py-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">Gravar</button>
             <button onClick={() => { onDeleteRoom(selectedRoom.id); setSelectedRoom(null); }} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold uppercase border border-red-500/20 hover:bg-red-500/20 transition-all">Excluir</button>
           </div>
        </div>
      )}

      <Stage 
        width={width} 
        height={height} 
        draggable 
        onWheel={handleWheel}
        ref={stageRef}
        pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        onPointerDown={(e) => { if (e.target === e.target.getStage()) setSelectedRoom(null) }}
      >
        <Layer>
          <GridBackground width={width * 5} height={height * 5} />
          
          <Group x={initialPosition.x} y={initialPosition.y} scale={{ x: initialScale, y: initialScale }}>
            <Rect
              x={bounds.minX - 20}
              y={bounds.minY - 20}
              width={bounds.contentWidth + 40}
              height={bounds.contentHeight + 40}
              fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
              stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={1}
              cornerRadius={8}
            />

            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id
              return (
                <Group
                  key={room.id}
                  x={room.x}
                  y={room.y}
                  onClick={() => setSelectedRoom(room)}
                  onTap={() => setSelectedRoom(room)}
                >
                  <Rect
                    width={room.width}
                    height={room.height}
                    fill={isSelected ? 'rgba(16, 185, 129, 0.4)' : (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')}
                    stroke={isSelected ? '#10b981' : '#10b981'}
                    strokeWidth={isSelected ? 2 / initialScale : 1 / initialScale}
                    cornerRadius={2 / initialScale}
                  />
                  <Text
                    text={room.number || room.name}
                    width={room.width}
                    height={room.height}
                    align="center"
                    verticalAlign="middle"
                    fill={isDark ? '#e2e8f0' : '#1e293b'}
                    fontSize={Math.max(6, 10 / initialScale)}
                    fontFamily="system-ui, sans-serif"
                    fontStyle="600"
                  />
                </Group>
              )
            })}
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}
