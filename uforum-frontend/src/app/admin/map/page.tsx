'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeft, MapPin, Trash2, Layers } from 'lucide-react'
import Link from 'next/link'

import { useAuthStore } from '@/store/auth'
import { mapApi } from '@/lib/api'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { AdminNav } from '@/components/admin/AdminNav'
import type { MapBlock } from '@/types'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-6 h-6 border-2 border-[var(--emerald-500)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Carregando mapa interativo...</p>
    </div>
  )
})

import { BlockEditorModal } from '@/components/admin/map/BlockEditorModal'

// Interface and type inside page (keep here or use from types)
type ModalMode = 'CREATE' | 'EDIT' | null;

export default function AdminMapPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [selectedBlock, setSelectedBlock] = useState<MapBlock | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [currentCoord, setCurrentCoord] = useState<{ lat: number, lng: number } | null>(null)
  const [isDelOpen, setIsDelOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) return;
    if (user && user.role !== 'ADMIN') {
      toast.error('Acesso negado. Apenas administradores.')
      router.push('/feed')
    }
  }, [isAuthenticated, user, router])

  const { data: mapBlocks = [] } = useQuery({
    queryKey: ['map-blocks'],
    queryFn: () => mapApi.listBlocks().then((r) => r.data),
  })

  const { mutate: mutateCreate, isPending: isCreating } = useMutation({
    mutationFn: (d: any) => mapApi.createBlock(d),
    onSuccess: () => {
      toast.success('Bloco e grid de salas gerados com sucesso!')
      qc.invalidateQueries({ queryKey: ['map-blocks'] })
      closeModal()
    },
    onError: () => toast.error('Erro ao salvar nova localização.')
  })

  const { mutate: mutateUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (d: any) => mapApi.updateBlock(selectedBlock!.id, d),
    onSuccess: () => {
      toast.success('Localização atualizada com sucesso!')
      qc.invalidateQueries({ queryKey: ['map-blocks'] })
      qc.invalidateQueries({ queryKey: ['floors', selectedBlock!.id] })
      closeModal()
    },
    onError: () => toast.error('Erro ao atualizar localização.')
  })

  const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => mapApi.deleteBlock(selectedBlock!.id),
    onSuccess: () => {
      toast.success('Localização excluída.')
      qc.invalidateQueries({ queryKey: ['map-blocks'] })
      setIsDelOpen(false)
      closeModal()
    },
    onError: () => {
      toast.error('Erro ao tentar excluir.')
      setIsDelOpen(false)
    }
  })

  const closeModal = () => {
    setModalMode(null)
    setCurrentCoord(null)
    setSelectedBlock(null)
  }

  if (!user || user.role !== 'ADMIN') {
    return <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }} />
  }

  const isLoading = isCreating || isUpdating || isDeleting;

  return (
    <div className="flex flex-col h-[100dvh] w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="page-wrap pt-6 w-full max-w-5xl flex-shrink-0">
        <AdminNav />
        <div className="flex items-center justify-between mt-3 mb-1">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Clique no mapa para adicionar um bloco, ou clique em um bloco existente para editar.</p>
        </div>
      </div>

      <div className="flex-1 relative cursor-crosshair">
        <LeafletMap
          blocks={mapBlocks as MapBlock[]}
          selected={selectedBlock}
          userPos={null}
          onSelect={(b) => {
            setSelectedBlock(b)
            setCurrentCoord({ lat: b.latitude, lng: b.longitude })
            setModalMode('EDIT')
          }}
          onMapClick={(lat, lng) => {
            setSelectedBlock(null)
            setCurrentCoord({ lat, lng })
            setModalMode('CREATE')
          }}
        />
      </div>

      {modalMode && currentCoord && (
        <BlockEditorModal
          coord={currentCoord}
          block={selectedBlock}
          mode={modalMode}
          onClose={closeModal}
          onSaveCreate={mutateCreate}
          onSaveUpdate={mutateUpdate}
          isSaving={isCreating || isUpdating}
          onDeleteBlock={() => setIsDelOpen(true)}
        />
      )}

      {selectedBlock && (
        <ConfirmModal 
          isOpen={isDelOpen}
          onClose={() => setIsDelOpen(false)}
          onConfirm={() => mutateDelete()}
          loading={isDeleting}
          title="Excluir Localização"
          description={`Deseja excluir "${selectedBlock.name}" e todas as suas salas permanentemente do mapa?`}
          confirmText="Sim, Excluir"
        />
      )}
    </div>
  )
}
