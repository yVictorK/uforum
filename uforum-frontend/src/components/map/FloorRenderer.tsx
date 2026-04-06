'use client'
import React, { useCallback, useMemo } from 'react'
import { Stage, Layer, Rect, Text, Group, Line, Circle } from 'react-konva'
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { Room } from '@/types'
import { useTheme } from '@/components/providers/ThemeProvider'
import Konva from 'konva'

interface FloorRendererProps {
  rooms: Room[]
  selectedRoomId?: string | null
  onRoomClick?: (room: Room) => void
  width: number
  height: number
}

const ROOM_COLORS: Record<string, { fillDark: string; fillLight: string; stroke: string }> = {
  CLASSROOM: { fillDark: 'rgba(2, 131, 59, 0.25)', fillLight: 'rgba(2, 131, 59, 0.15)', stroke: '#10b981' },
  LAB: { fillDark: 'rgba(59, 130, 246, 0.25)', fillLight: 'rgba(59, 130, 246, 0.15)', stroke: '#3B82F6' },
  ADMIN: { fillDark: 'rgba(245, 158, 11, 0.25)', fillLight: 'rgba(245, 158, 11, 0.15)', stroke: '#F59E0B' },
  OTHER: { fillDark: 'rgba(107, 114, 128, 0.25)', fillLight: 'rgba(107, 114, 128, 0.15)', stroke: '#6B7280' },
}

const GridBackground = ({ width, height, scale }: any) => {
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

function FloorRendererInner({ rooms, selectedRoomId, onRoomClick, width, height }: FloorRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const stageRef = React.useRef<Konva.Stage>(null)
  const [scale, setScale] = React.useState(1)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  
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

  // Initial fit-to-screen scale - more aggressive for larger rooms
  const initialScale = useMemo(() => {
    const w = Math.floor(width)
    const h = Math.floor(height)
    if (w < 50 || h < 50) return 1
    const sX = (w - padding * 2) / bounds.contentWidth
    const sY = (h - padding * 2) / bounds.contentHeight
    return Math.min(sX, sY) * 1.4 // Balanced large rooms
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

  // Reset to initial view
  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const oldScale = stage.scaleX()

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1
    
    // Limits
    if (newScale < 0.1 || newScale > 10) return

    stage.scale({ x: newScale, y: newScale })

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    stage.position(newPos)
    stage.batchDraw()
  }

  const handleCursor = useCallback((e: any, cursor: string) => {
    const container = e.target.getStage()?.container()
    if (container) container.style.cursor = cursor
  }, [])

  if (rooms.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <p className="text-zinc-500 text-sm">Nenhuma sala cadastrada neste andar</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border relative group" 
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
      
      {/* Decorative radial gradient for depth */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at 50% 50%, var(--emerald-500) 0%, transparent 80%)', filter: 'blur(120px)' }} />
      
      {/* Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={resetView} className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-xl hover:scale-105 active:scale-95 transition-all text-[var(--text-primary)]" title="Resetar Zoom">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <Stage 
        width={width} 
        height={height} 
        draggable 
        onWheel={handleWheel}
        ref={stageRef}
        pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      >
        <Layer>
          {/* Subtle Grid */}
          <GridBackground width={width * 5} height={height * 5} scale={1} />
          
          <Group x={initialPosition.x} y={initialPosition.y} scale={{ x: initialScale, y: initialScale }}>
            {/* Building Envelope */}
            <Rect
              x={bounds.minX - 20}
              y={bounds.minY - 20}
              width={bounds.contentWidth + 40}
              height={bounds.contentHeight + 40}
              fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
              stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={1}
              cornerRadius={8}
              listening={false}
            />

            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id
              const colors = ROOM_COLORS[room.type] || ROOM_COLORS.OTHER

              return (
                <Group
                  key={room.id}
                  x={room.x}
                  y={room.y}
                  onClick={() => onRoomClick?.(room)}
                  onTap={() => onRoomClick?.(room)}
                >
                  <Rect
                    width={room.width}
                    height={room.height}
                    fill={isSelected ? 'rgba(16, 185, 129, 0.4)' : (isDark ? colors.fillDark : colors.fillLight)}
                    stroke={isSelected ? '#10b981' : colors.stroke}
                    strokeWidth={isSelected ? 2 / initialScale : 1 / initialScale}
                    cornerRadius={2 / initialScale}
                    onMouseEnter={(e) => handleCursor(e, 'pointer')}
                    onMouseLeave={(e) => handleCursor(e, 'default')}
                  />
                  <Text
                    text={room.number || room.name}
                    width={room.width}
                    height={room.height}
                    align="center"
                    verticalAlign="middle"
                    fill={isSelected ? '#ffffff' : (isDark ? '#e2e8f0' : '#1e293b')}
                    fontSize={Math.max(6, 12 / initialScale)}
                    fontFamily="Outfit, system-ui, sans-serif"
                    fontStyle="600"
                    listening={false}
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

export default FloorRendererInner
