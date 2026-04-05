'use client'
import { use, useState } from 'react'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Users, Lock, Plus, UserCheck, Settings, Trash2, Edit3, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/post/PostCard'
import { PostSk, Modal } from '@/components/ui/index'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { communitiesApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { fmtNum, timeAgo } from '@/lib/utils'
import type { Post, Page } from '@/types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const editSchema = z.object({
  description: z.string().min(10).max(500).optional(),
  bannerUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  iconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})
type EditForm = z.infer<typeof editSchema>

export default function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [joining, setJoining] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const qc = useQueryClient()

  const { data: community, isLoading: cLoading } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communitiesApi.get(slug).then((r) => r.data),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['community-posts', slug],
    queryFn: ({ pageParam = 0 }) => communitiesApi.getPosts(slug, pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: !!community,
  })

  const posts = data?.pages.flatMap((p) => p.content) ?? []

  const isCreator = user && community && community.createdBy.id === user.id
  const isAdmin = user?.role === 'ADMIN'
  const canManage = isCreator || isAdmin

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  })

  const handleJoinLeave = async () => {
    if (!isAuthenticated || joining) return
    setJoining(true)
    try {
      if (community?.isMember) {
        await communitiesApi.leave(slug)
        toast.success('Você saiu da comunidade')
      } else {
        await communitiesApi.join(slug)
        toast.success(`Bem-vindo(a) a ${community?.name}!`)
      }
      await qc.invalidateQueries({ queryKey: ['community', slug] })
      await qc.invalidateQueries({ queryKey: ['my-communities'] })
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro')
    } finally { setJoining(false) }
  }

  const handleEdit = async (data: EditForm) => {
    try {
      await communitiesApi.update(slug, {
        description: data.description || undefined,
        bannerUrl: data.bannerUrl || undefined,
        iconUrl: data.iconUrl || undefined,
      })
      toast.success('Comunidade atualizada!')
      await qc.invalidateQueries({ queryKey: ['community', slug] })
      reset()
      setEditOpen(false)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao atualizar')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${community?.name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await communitiesApi.delete(slug)
      toast.success('Comunidade excluída')
      await qc.invalidateQueries({ queryKey: ['communities'] })
      router.push('/communities')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao excluir')
    } finally { setDeleting(false) }
  }

  if (cLoading) return (
    <div className="page-wrap pt-0 pb-6 sm:py-6">
      <div className="h-40 skeleton rounded-2xl mb-6" />
      <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
    </div>
  )
  if (!community) return <div className="page-wrap py-12 text-center" style={{ color: 'var(--text-muted)' }}>Comunidade não encontrada</div>

  return (
    <div>
      <div className="relative h-40 sm:h-52 overflow-hidden">
        {community.bannerUrl ? (
          <img src={community.bannerUrl} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)' }} />
      </div>

      <div className="page-wrap">
        <div className="relative -mt-14 mb-6 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4" style={{ borderColor: 'var(--bg-primary)', boxShadow: '0 0 0 1px var(--emerald-500)/20' }}>
              {community.iconUrl ? (
                <img src={community.iconUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-2xl" style={{ background: 'var(--bg-secondary)', color: 'var(--emerald-500)' }}>
                  {community.name[0]}
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {community.name} {community.isPrivate && <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </h1>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{fmtNum(community.memberCount)} membros</span>
                <span>· criada {timeAgo(community.createdAt)}</span>
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="pb-2">
              <button onClick={handleJoinLeave} disabled={joining}
                className={community.isMember ? 'btn-outline text-sm py-1.5 px-4' : 'btn-green text-sm py-1.5 px-4'}
                style={joining ? { opacity: 0.5 } : {}}>
                {joining ? '...' : community.isMember
                  ? <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4" />Seguindo</span>
                  : 'Entrar'}
              </button>
            </div>
          )}
        </div>

        <p className="mb-6 max-w-2xl text-sm" style={{ color: 'var(--text-secondary)' }}>{community.description}</p>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            {isAuthenticated && community.isMember && (
              <button onClick={() => setCreateOpen(true)} className="card w-full p-4 flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-all text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--emerald-500)', color: '#fff' }}>
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Criar post em {community.name}...</span>
              </button>
            )}

            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
            ) : posts.length === 0 ? (
              <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>Nenhum post ainda. Seja o primeiro!</div>
            ) : (
              <>
                {posts.map((p) => <PostCard key={p.id} post={p} showCommunity={false} onDelete={() => refetch()} />)}
                {hasNextPage && (
                  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-outline w-full justify-center py-3">
                    {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
                  </button>
                )}
              </>
            )}
          </div>

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-4 sticky top-20 space-y-3">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sobre</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{community.description}</p>
              <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                <div>{fmtNum(community.memberCount)} membros</div>
                <div>Criada por <span className="font-bold" style={{ color: 'var(--emerald-500)' }}>@{community.createdBy.username}</span></div>
              </div>
              {canManage && (
                <button onClick={() => setEditOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-[var(--bg-secondary)]"
                  style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <Settings className="w-3.5 h-3.5" />Gerenciar comunidade
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} communityId={community.id} onSuccess={refetch} />

      <Modal open={editOpen} onClose={() => { reset(); setEditOpen(false) }} title="Editar Comunidade" size="md">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div>
            <label className="label">Descrição</label>
            <textarea {...register('description')} rows={3} placeholder={community.description}
              className="input resize-none" defaultValue={community.description} />
          </div>
          <div>
            <label className="label">URL do Banner</label>
            <input {...register('bannerUrl')} placeholder="https://..." className="input"
              defaultValue={community.bannerUrl ?? ''} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Imagem horizontal recomendada (1200×300px)</p>
          </div>
          <div>
            <label className="label">URL do Ícone</label>
            <input {...register('iconUrl')} placeholder="https://..." className="input"
              defaultValue={community.iconUrl ?? ''} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Imagem quadrada recomendada (400×400px)</p>
          </div>
          <div className="flex justify-between items-center pt-2">
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-[#ef4444]/10"
              style={{ color: '#ef4444' }}>
              <Trash2 className="w-3.5 h-3.5" />{deleting ? 'Excluindo...' : 'Excluir comunidade'}
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => { reset(); setEditOpen(false) }} className="btn-outline">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-green">
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
