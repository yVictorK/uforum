'use client'
import { useEffect, useRef } from 'react'
import type { MapBlock } from '@/types'

interface Props {
  blocks: MapBlock[]
  selected: MapBlock | null
  userPos: [number, number] | null
  onSelect: (b: MapBlock) => void
  onMapClick?: (lat: number, lng: number) => void
}

const UFAM: [number, number] = [-3.0995, -59.9930]

export default function LeafletMap({ blocks, selected, userPos, onSelect, onMapClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(ref.current!, { center: UFAM, zoom: 16, zoomControl: false })
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 20,
      }).addTo(map)

      map.on('click', (e: any) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng)
        }
      })

      mapRef.current = map

      blocks.forEach((block) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: #00c44f; color: #000; padding: 3px 8px;
            border-radius: 8px; font-size: 11px; font-weight: 800;
            white-space: nowrap; box-shadow: 0 2px 12px rgba(0,196,79,0.4);
            border: 1px solid rgba(0,196,79,0.6); cursor: pointer;
            transition: all 0.15s;
          ">${block.code}</div>`,
          iconAnchor: [20, 16],
        })
        L.marker([block.latitude, block.longitude], { icon })
          .addTo(map)
          .on('click', () => onSelect(block))
      })
    })

    return () => { mapRef.current?.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  useEffect(() => {
    if (selected && mapRef.current) mapRef.current.setView([selected.latitude, selected.longitude], 18, { animate: true })
  }, [selected])

  useEffect(() => {
    if (!userPos || !mapRef.current) return
    import('leaflet').then((L) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#00c44f;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(0,196,79,0.25),0 2px 8px rgba(0,0,0,0.4);"/>`,
        iconAnchor: [7, 7],
      })
      L.marker(userPos, { icon }).addTo(mapRef.current!).bindPopup('Você está aqui')
    })
  }, [userPos])

  return <div ref={ref} className="w-full h-full relative isolate z-0" />
}
