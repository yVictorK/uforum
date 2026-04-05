'use client'
import { useEffect, useRef, useState } from 'react'
import type { MapBlock } from '@/types'
import Link from 'next/link'
import { Maximize2 } from 'lucide-react'

interface Props {
  blocks: MapBlock[]
  selected: MapBlock | null
  userPos: [number, number] | null
  onSelect: (b: MapBlock) => void
  onMapClick?: (lat: number, lng: number) => void
  showExpandButton?: boolean
}

const UFAM: [number, number] = [-3.0907, -59.9635]

export default function LeafletMap({ blocks, selected, userPos, onSelect, onMapClick, showExpandButton }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<ReturnType<typeof import('leaflet')['map']> | null>(null)

  const initializingRef = useRef(false)

  useEffect(() => {
    if (!ref.current || map || initializingRef.current) return

    initializingRef.current = true

    import('leaflet').then((L) => {
      const container = ref.current
      if (!container || (container as any)._leaflet_id) {
        initializingRef.current = false
        return
      }

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const mapInstance = L.map(container, { center: UFAM, zoom: 16, zoomControl: false })
      L.control.zoom({ position: 'topright' }).addTo(mapInstance)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 20,
      }).addTo(mapInstance)

      mapInstance.on('click', (e: any) => {
        if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng)
      })

      setMap(mapInstance)
      initializingRef.current = false
    })

    return () => {

    }
  }, [onMapClick, map])

  useEffect(() => {
    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) return

    let isMounted = true
    const markers: any[] = []

    import('leaflet').then((L) => {
      if (!isMounted || !map) return

      blocks.forEach((block) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: #02833B; color: #fff; padding: 4px 10px;
            border-radius: 10px; font-size: 11px; font-weight: 800;
            white-space: nowrap; box-shadow: 0 4px 12px rgba(2,131,59,0.5);
            border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
            transition: all 0.15s;
          ">${block.code}</div>`,
          iconAnchor: [20, 16],
        })
        const m = L.marker([block.latitude, block.longitude], { icon })
          .addTo(map)
          .on('click', () => onSelect(block))

        markers.push(m)
      })
    })

    return () => {
      isMounted = false
      markers.forEach(m => m.remove())
    }
  }, [blocks, onSelect, map])

  useEffect(() => {
    if (selected && map) map.setView([selected.latitude, selected.longitude], 18, { animate: true })
  }, [selected, map])

  useEffect(() => {
    if (!userPos || !map) return
    import('leaflet').then((L) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#02833B;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(2,131,59,0.25),0 2px 8px rgba(0,0,0,0.4);"/>`,
        iconAnchor: [7, 7],
      })
      L.marker(userPos, { icon }).addTo(map!).bindPopup('Você está aqui')
    })
  }, [userPos, map])

  return (
    <div ref={ref} className="w-full h-full relative isolate z-0">
      {showExpandButton && (
        <Link href="/map"
          className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: '#02833B', color: '#fff' }}>
          <Maximize2 className="w-3.5 h-3.5" />
          Expandir mapa
        </Link>
      )}
    </div>
  )
}
