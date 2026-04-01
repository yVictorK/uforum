'use client'
import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { UserCheck, UserPlus, Edit3, MapPin, BookOpen, Calendar, FileText, Package, CalendarDays, Camera } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from '@/components/post/PostCard'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Modal } from '@/components/ui/index'
import { Sk } from '@/components/ui/index'
import { usersApi, marketplaceApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { roleLabel, fmtNum, fmtDate, cn } from '@/lib/utils'
import type { Post, Product, Page } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  fullName: z.string().min(3).optional(),
  bio: z.string().max(500).optional(),
  course: z.string().optional(),
  semester: z.coerce.number().min(1).max(12).optional().or(z.literal('')),
  age: z.coerce.number().min(16).max(100).optional().or(z.literal('')),
  neighborhood: z.string().optional(),
  whatsappNumber: z.string().optional(),
  profilePictureUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  bannerUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})
type F = z.infer<typeof schema>
type Tab = 'posts' | 'products' | 'events'

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { user: me, isAuthenticated, updateUser } = useAuthStore()
  const qc = useQueryClient()
  const isOwn = me?.username === username
  const [tab, setTab] = useState<Tab>('posts')
  const [editOpen, setEditOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username).then((r) => r.data)
  })

  const { data: postsData, isLoading: pLoading } = useInfiniteQuery({
    queryKey: ['u-posts', username],
    queryFn: ({ pageParam = 0 }) => usersApi.getPosts(username, pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: tab === 'posts' && !!profile,
  })

  const { data: prodsData, isLoading: prLoading } = useInfiniteQuery({
    queryKey: ['u-products', username],
    queryFn: ({ pageParam = 0 }) => marketplaceApi.getMine(pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Product>) => last.last ? undefined : last.number + 1,
    enabled: tab === 'products' && isOwn && !!profile,
  })

  const followMut = useMutation({
    mutationFn: () => isFollowing ? usersApi.unfollow(username) : usersApi.follow(username),
    onSuccess: () => { setIsFollowing(!isFollowing); toast.success(isFollowing ? 'Deixou de seguir' : 'Seguindo!') },
    onError: () => toast.error('Erro'),
  })

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onEdit = async (d: F) => {
    try {
      const payload: Record<string, unknown> = {}
      if (d.fullName) payload.fullName = d.fullName
      if (d.bio !== undefined) payload.bio = d.bio
      if (d.course) payload.course = d.course
      if (d.semester !== '' && d.semester !== undefined) payload.semester = Number(d.semester)
      if (d.age !== '' && d.age !== undefined) payload.age = Number(d.age)
      if (d.neighborhood) payload.neighborhood = d.neighborhood
      if (d.whatsappNumber) payload.whatsappNumber = d.whatsappNumber
      if (d.profilePictureUrl) payload.profilePictureUrl = d.profilePictureUrl
      if (d.bannerUrl !== undefined) payload.bannerUrl = d.bannerUrl

      await usersApi.updateProfile(payload)
      await qc.invalidateQueries({ queryKey: ['profile', username] })
      // Update auth store if own profile
      if (isOwn && d.profilePictureUrl) updateUser({ profilePictureUrl: d.profilePictureUrl })
      toast.success('Perfil atualizado!')
      setEditOpen(false)
    } catch { toast.error('Erro ao atualizar') }
  }

  const posts = postsData?.pages.flatMap((p) => p.content) ?? []
  const prods = prodsData?.pages.flatMap((p) => p.content) ?? []

  if (isLoading) return (
    <div className="page-wrap py-6 max-w-3xl space-y-4">
      <div className="h-32 skeleton rounded-2xl" />
      <div className="flex gap-4"><Sk className="w-20 h-20 rounded-full" /><div className="flex-1 space-y-2 pt-2"><Sk className="h-6 w-40" /><Sk className="h-4 w-24" /></div></div>
    </div>
  )
  if (!profile) return <div className="page-wrap py-12 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Usuário não encontrado</div>

  const tabs = [
    { key: 'posts' as Tab, label: 'Posts', icon: FileText, count: profile.postsCount },
    ...(isOwn ? [{ key: 'products' as Tab, label: 'Anúncios', icon: Package }] : []),
    { key: 'events' as Tab, label: 'Eventos', icon: CalendarDays },
  ]

  return (
    <div className="page-wrap py-6 max-w-3xl">
      <div className="card overflow-hidden mb-6">
        {/* Banner */}
        <div className="relative h-32 group">
          {profile.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(0,196,79,0.15) 0%, rgba(0,196,79,0.04) 100%)' }} />
          )}
          {isOwn && (
            <button onClick={() => setEditOpen(true)}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Camera className="w-4 h-4" />Editar banner
              </div>
            </button>
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar with edit overlay */}
            <div className="relative group/avatar">
              <Avatar src={profile.profilePictureUrl} name={profile.fullName} size="xl" ring />
              {isOwn && (
                <button onClick={() => setEditOpen(true)}
                  className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-12">
              {isOwn ? (
                <button onClick={() => setEditOpen(true)} className="btn-outline text-sm py-2">
                  <Edit3 className="w-4 h-4" />Editar perfil
                </button>
              ) : isAuthenticated && (
                <button onClick={() => followMut.mutate()} disabled={followMut.isPending}
                  className={cn('text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50',
                    isFollowing ? 'btn-outline' : 'btn-green')}>
                  {isFollowing ? <><UserCheck className="w-4 h-4" />Seguindo</> : <><UserPlus className="w-4 h-4" />Seguir</>}
                </button>
              )}
            </div>
          </div>

          <h1 className="text-xl font-black">{profile.fullName}</h1>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>@{profile.username}</p>
          <span className="badge-green text-xs">{roleLabel(profile.role)}</span>

          {profile.bio && <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{profile.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {profile.course && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{profile.course}{profile.semester ? ` · ${profile.semester}º período` : ''}</span>}
            {profile.neighborhood && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.neighborhood}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />desde {fmtDate(profile.createdAt)}</span>
          </div>

          <div className="flex gap-5 mt-4">
            {[{ v: fmtNum(profile.postsCount), l: 'posts' }, { v: fmtNum(profile.followersCount), l: 'seguidores' }, { v: fmtNum(profile.followingCount), l: 'seguindo' }].map(({ v, l }) => (
              <div key={l}><span className="font-bold">{v}</span> <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</span></div>
            ))}
          </div>

          {profile.currentSubjects.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Matérias</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.currentSubjects.map((s: string) => <span key={s} className="badge-zinc text-xs">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === key ? 'font-bold' : '')}
            style={tab === key ? { background: '#00c44f', color: '#000' } : { color: 'rgba(255,255,255,0.4)' }}>
            <Icon className="w-3.5 h-3.5" />{label}
            {count !== undefined && <span className="text-xs opacity-70">({fmtNum(count)})</span>}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        pLoading ? <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div>
        : posts.length === 0 ? <div className="card p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhum post</div>
        : <div className="space-y-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
      )}

      {tab === 'products' && isOwn && (
        prLoading ? <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}</div>
        : prods.length === 0 ? <div className="card p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhum anúncio</div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{prods.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}

      {tab === 'events' && (
        <div className="card p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Eventos confirmados aparecerão aqui</div>
      )}

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Perfil" size="lg">
        <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome</label>
              <input {...register('fullName')} className="input" defaultValue={profile.fullName} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea {...register('bio')} rows={3} className="input resize-none" defaultValue={profile.bio ?? ''} />
            </div>

            {/* Photo URLs */}
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />URL da foto de perfil</label>
              <input {...register('profilePictureUrl')} placeholder="https://..." className="input" defaultValue={profile.profilePictureUrl ?? ''} />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Cole o link de uma imagem (ex: do Imgur, Google Photos)</p>
            </div>
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />URL do banner</label>
              <input {...register('bannerUrl')} placeholder="https://..." className="input" defaultValue={profile.bannerUrl ?? ''} />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Imagem horizontal recomendada (1200×300px)</p>
            </div>

            <div>
              <label className="label">Curso</label>
              <input {...register('course')} className="input" defaultValue={profile.course ?? ''} />
            </div>
            <div>
              <label className="label">Período</label>
              <input {...register('semester')} type="number" min={1} max={12} className="input" defaultValue={profile.semester ?? ''} />
            </div>
            <div>
              <label className="label">Idade</label>
              <input {...register('age')} type="number" className="input" defaultValue={profile.age ?? ''} />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input {...register('neighborhood')} className="input" defaultValue={profile.neighborhood ?? ''} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">WhatsApp</label>
              <input {...register('whatsappNumber')} placeholder="+5592999999999" className="input" defaultValue={profile.whatsappNumber ?? ''} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-green">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
