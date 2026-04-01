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
    <div className="page-wrap py-6">
      <div className="h-40 skeleton rounded-2xl mb-6" />
      <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
    </div>
  )
  if (!community) return <div className="page-wrap py-12 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Comunidade não encontrada</div>

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        {community.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={community.bannerUrl} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(0,196,79,0.15) 0%, rgba(0,196,79,0.04) 100%)', borderBottom: '1px solid rgba(0,196,79,0.1)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0d0d0d 0%, transparent 60%)' }} />

        {/* Manage buttons — visible only to creator/admin */}
        {canManage && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Edit3 className="w-3.5 h-3.5" />Editar
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,69,69,0.2)', color: '#ff6b6b', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,69,69,0.3)' }}>
              <Trash2 className="w-3.5 h-3.5" />{deleting ? '...' : 'Excluir'}
            </button>
          </div>
        )}
      </div>

      <div className="page-wrap">
        <div className="relative -mt-14 mb-6 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4" style={{ borderColor: '#0d0d0d', boxShadow: '0 0 0 1px rgba(0,196,79,0.2)' }}>
              {community.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={community.iconUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-2xl" style={{ background: 'rgba(0,196,79,0.1)', color: '#00c44f' }}>
                  {community.name[0]}
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-black flex items-center gap-2">
                {community.name} {community.isPrivate && <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
              </h1>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
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

        <p className="mb-6 max-w-2xl" style={{ color: 'rgba(255,255,255,0.5)' }}>{community.description}</p>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            {isAuthenticated && community.isMember && (
              <button onClick={() => setCreateOpen(true)} className="card w-full p-4 flex items-center gap-3 hover:bg-[#1a1a1a] transition-all text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,196,79,0.1)', color: '#00c44f' }}>
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Criar post em {community.name}...</span>
              </button>
            )}

            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
            ) : posts.length === 0 ? (
              <div className="card p-10 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhum post ainda. Seja o primeiro!</div>
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
              <h3 className="font-bold text-sm">Sobre</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{community.description}</p>
              <div className="text-xs space-y-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <div>{fmtNum(community.memberCount)} membros</div>
                <div>Criada por <span className="text-[#00c44f]">@{community.createdBy.username}</span></div>
              </div>
              {canManage && (
                <button onClick={() => setEditOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-[#2a2a2a]"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  <Settings className="w-3.5 h-3.5" />Gerenciar comunidade
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} communityId={community.id} onSuccess={refetch} />

      {/* Edit community modal */}
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
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Imagem horizontal recomendada (1200×300px)</p>
          </div>
          <div>
            <label className="label">URL do Ícone</label>
            <input {...register('iconUrl')} placeholder="https://..." className="input"
              defaultValue={community.iconUrl ?? ''} />
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Imagem quadrada recomendada (400×400px)</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { reset(); setEditOpen(false) }} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-green">
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
