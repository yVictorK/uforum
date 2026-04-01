'use client'
import { useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Hash } from 'lucide-react'
import { CommunityCard } from '@/components/community/CommunityCard'
import { Modal } from '@/components/ui/index'
import { CommSk, Empty } from '@/components/ui/index'
import { communitiesApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Community, Page } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({ name: z.string().min(3).max(100), description: z.string().min(10).max(500), isPrivate: z.boolean().default(false) })
type F = z.infer<typeof schema>

export default function CommunitiesPage() {
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['communities', q],
    queryFn: ({ pageParam = 0 }) => communitiesApi.list(pageParam as number, q || undefined).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Community>) => last.last ? undefined : last.number + 1,
  })
  const communities = data?.pages.flatMap((p) => p.content) ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { isPrivate: false } })
  const onCreate = async (d: F) => {
    try { await communitiesApi.create(d); toast.success(`${d.name} criada!`); reset(); setCreateOpen(false); await qc.invalidateQueries({ queryKey: ['communities'] }); refetch() }
    catch (err: unknown) { toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro') }
  }

  return (
    <div className="page-wrap py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Comunidades</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Encontre sua turma</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreateOpen(true)} className="btn-green text-sm">
            <Plus className="w-4 h-4" />Nova Comunidade
          </button>
        )}
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar comunidades..." className="input pl-10" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <CommSk key={i} />)}</div>
      ) : communities.length === 0 ? (
        <Empty icon={Hash} title="Nenhuma comunidade" description={q ? 'Tente outros termos' : 'Crie a primeira!'} />
      ) : (
        <div className="space-y-3">
          {communities.map((c) => <CommunityCard key={c.id} community={c} />)}
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-outline w-full justify-center py-3">
              {isFetchingNextPage ? 'Carregando...' : 'Mais'}
            </button>
          )}
        </div>
      )}

      <Modal open={createOpen} onClose={() => { reset(); setCreateOpen(false) }} title="Nova Comunidade">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input {...register('name')} placeholder="Nome da comunidade" className="input" />
            {errors.name && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea {...register('description')} rows={3} placeholder="Sobre o que é?" className="input resize-none" />
            {errors.description && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.description.message}</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isPrivate')} type="checkbox" className="rounded" />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Privada</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { reset(); setCreateOpen(false) }} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-green">{isSubmitting ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
