import { create } from 'zustand'
import { MapBlock, Floor, Room } from '@/types'

interface MapState {
  selectedBlock: MapBlock | null
  selectedFloor: Floor | null
  highlightedRoomId: string | null
  buildingViewOpen: boolean
  
  setSelectedBlock: (block: MapBlock | null) => void
  setSelectedFloor: (floor: Floor | null) => void
  setHighlightedRoomId: (id: string | null) => void
  setBuildingViewOpen: (open: boolean) => void
  
  // Navigation helper: Search results use this to trigger animations
  navigateToRoom: (room: Room, floor: Floor, block: MapBlock) => void
}

export const useMapStore = create<MapState>((set) => ({
  selectedBlock: null,
  selectedFloor: null,
  highlightedRoomId: null,
  buildingViewOpen: false,

  setSelectedBlock: (block) => set({ selectedBlock: block, selectedFloor: null, highlightedRoomId: null }),
  setSelectedFloor: (floor) => set({ selectedFloor: floor, highlightedRoomId: null }),
  setHighlightedRoomId: (id) => set({ highlightedRoomId: id }),
  setBuildingViewOpen: (open) => set({ buildingViewOpen: open }),

  navigateToRoom: (room, floor, block) => set({
    selectedBlock: block,
    selectedFloor: floor,
    highlightedRoomId: room.id,
    buildingViewOpen: true
  })
}))
