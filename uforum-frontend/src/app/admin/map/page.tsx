'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { useAuthStore } from '@/store/auth'
import { mapApi } from '@/lib/api'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { AdminNav } from '@/components/admin/AdminNav'
import type { MapBlock } from '@/types'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

interface BlockForm {
  name: string;
  code: string;
  description: string;
  floorCount: number;
}

type ModalMode = 'CREATE' | 'EDIT' | null;

export default function AdminMapPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [selectedBlock, setSelectedBlock] = useState<MapBlock | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [currentCoord, setCurrentCoord] = useState<{ lat: number, lng: number } | null>(null)
  const [isDelOpen, setIsDelOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlockForm>()

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
      toast.success('Bloco adicionado ao mapa com sucesso!')
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
    reset({ name: '', code: '', description: '', floorCount: 1 })
  }

  const onSubmit = (data: BlockForm) => {
    if (!currentCoord) return;
    const payload = {
      ...data,
      latitude: currentCoord.lat,
      longitude: currentCoord.lng,
      floorCount: Number(data.floorCount)
    }

    if (modalMode === 'CREATE') {
      mutateCreate(payload)
    } else if (modalMode === 'EDIT') {
      mutateUpdate(payload)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return <div className="min-h-screen bg-zinc-950" />
  }

  const isLoading = isCreating || isUpdating || isDeleting;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950">
      <div className="page-wrap pt-6 w-full max-w-5xl flex-shrink-0">
        <AdminNav />
      </div>

      <div className="flex-1 relative cursor-crosshair">
        <LeafletMap
          blocks={mapBlocks as MapBlock[]}
          selected={selectedBlock}
          userPos={null}
          onSelect={(b) => {
            setSelectedBlock(b)
            setCurrentCoord({ lat: b.latitude, lng: b.longitude })
            reset({ name: b.name, code: b.code, description: b.description || '', floorCount: b.floorCount })
            setModalMode('EDIT')
          }}
          onMapClick={(lat, lng) => {
            setSelectedBlock(null)
            setCurrentCoord({ lat, lng })
            reset({ name: '', code: '', description: '', floorCount: 1 })
            setModalMode('CREATE')
          }}
        />
      </div>

      {modalMode && currentCoord && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'CREATE' ? 'Adicionar Novo Local' : 'Editar Localização'}
              </h2>
              {modalMode === 'EDIT' && (
                <button type="button" onClick={() => setIsDelOpen(true)} disabled={isLoading}
                  className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Excluir Localização">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-emerald-400 mb-6 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md break-all">
              Lat: {currentCoord.lat.toFixed(6)} <br />
              Lng: {currentCoord.lng.toFixed(6)}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome do Estabelecimento / Bloco</label>
                <input
                  {...register('name', { required: true })}
                  placeholder="Ex: Biblioteca de Direito"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
                {errors.name && <span className="text-xs text-red-500 mt-1">Nome é obrigatório</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Sigla / Código</label>
                  <input
                    {...register('code', { required: true })}
                    placeholder="Ex: BDIR"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                  {errors.code && <span className="text-xs text-red-500 mt-1">Obrigatório</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Andares</label>
                  <input
                    type="number"
                    {...register('floorCount', { required: true, min: 1 })}
                    placeholder="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Ex: Biblioteca setorial do setor Norte. Entrada pela praça."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/50 mt-2">
                <button type="button" onClick={closeModal} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="btn-green py-2 px-6 shadow-glow-emerald">
                  {isLoading ? 'Carregando...' : modalMode === 'CREATE' ? 'Adicionar Ponto' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBlock && (
        <ConfirmModal 
          isOpen={isDelOpen}
          onClose={() => setIsDelOpen(false)}
          onConfirm={() => mutateDelete()}
          loading={isDeleting}
          title="Excluir Localização"
          description={`Deseja excluir "${selectedBlock.name}" permanentemente do mapa?`}
          confirmText="Sim, Excluir"
        />
      )}
    </div>
  )
}
