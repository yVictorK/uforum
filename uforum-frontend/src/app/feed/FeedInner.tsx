'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Globe, Users, Filter, ChevronRight, ShoppingBag, Hash, MapPin, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PostCard } from '@/components/post/PostCard'
import { CommunityCard } from '@/components/community/CommunityCard'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { PostSk, CommSk, ProductSk, Empty } from '@/components/ui/index'
import { postsApi, communitiesApi, marketplaceApi, mapApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import type { Post, Page, Community, Product, MapBlock } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Leaflet loaded dynamically — no SSR
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#161616' }}>
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00c44f', borderTopColor: 'transparent' }} />
    </div>
  )
})

type FeedTab = 'geral' | 'seguindo'

export default function FeedInner() {
  const sp = useSearchParams()
  const q = sp.get('q') ?? ''
  const openCreate = sp.get('create') === '1'
  const { isAuthenticated, user } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<FeedTab>('geral')
  const [createOpen, setCreateOpen] = useState(openCreate)
  const [mapOpen, setMapOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<MapBlock | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)

  useEffect(() => { if (openCreate) setCreateOpen(true) }, [openCreate])
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    )
  }, [])

  // ── Feed posts ──────────────────────────────────────────────
  const isFollowingTab = tab === 'seguindo' && isAuthenticated && !q

  const generalFeed = useInfiniteQuery({
    queryKey: ['feed', 'geral', q],
    queryFn: ({ pageParam = 0 }) =>
      postsApi.search(q || '', pageParam as number, 'new').then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: !isFollowingTab,
  })

  const followingFeed = useInfiniteQuery({
    queryKey: ['feed', 'seguindo'],
    queryFn: ({ pageParam = 0 }) =>
      postsApi.getFollowingFeed(pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: isFollowingTab,
  })

  const activeFeed = isFollowingTab ? followingFeed : generalFeed
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = activeFeed

  // FIX: when new post created, reset pages so it appears at top
  const handlePostCreated = () => {
    qc.resetQueries({ queryKey: ['feed'] })
  }

  // ── Sidebar data ─────────────────────────────────────────────
  const { data: commData, isLoading: commLoading } = useQuery({
    queryKey: ['comms-suggested'],
    queryFn: () => communitiesApi.list(0).then((r) => r.data),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['marketplace-preview'],
    queryFn: () => marketplaceApi.list(0).then((r) => r.data),
  })

  const { data: mapBlocks = [] } = useQuery({
    queryKey: ['map-blocks'],
    queryFn: () => mapApi.listBlocks().then((r) => r.data),
  })

  const posts = data?.pages.flatMap((p) => p.content) ?? []
  const comms: Community[] = commData?.content?.slice(0, 4) ?? []
  const products: Product[] = productsData?.content?.slice(0, 6) ?? []

  return (
    <div className="page-wrap py-6">
      <div className="flex gap-6">

        {/* ── Main feed column ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Search header */}
          {q && (
            <div className="mb-2">
              <h1 className="font-bold text-lg">Busca: <span style={{ color: '#00c44f' }}>&ldquo;{q}&rdquo;</span></h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{posts.length} resultados</p>
            </div>
          )}

          {/* ── Feed tabs: Geral / Seguindo ── */}
          {!q && (
            <div className="flex items-center justify-between">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => setTab('geral')}
                  className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all')}
                  style={tab === 'geral' ? { background: '#00c44f', color: '#000' } : { color: 'rgba(255,255,255,0.45)' }}>
                  <Globe className="w-3.5 h-3.5" />Geral
                </button>
                <button onClick={() => {
                  if (!isAuthenticated) { toast.error('Faça login para ver o feed de seguidos'); return }
                  setTab('seguindo')
                }}
                  className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all')}
                  style={tab === 'seguindo' ? { background: '#00c44f', color: '#000' } : { color: 'rgba(255,255,255,0.45)' }}>
                  <Users className="w-3.5 h-3.5" />Seguindo
                </button>
              </div>

              {isAuthenticated && (
                <button onClick={() => setCreateOpen(true)} className="btn-green text-sm py-2">
                  <Plus className="w-4 h-4" /><span className="hidden sm:block">Criar Post</span>
                </button>
              )}
            </div>
          )}

          {/* Create prompt */}
          {isAuthenticated && !q && (
            <button onClick={() => setCreateOpen(true)}
              className="card w-full p-4 flex items-center gap-3 hover:bg-[#1a1a1a] transition-all text-left">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'rgba(0,196,79,0.1)', border: '1px solid rgba(0,196,79,0.2)', color: '#00c44f' }}>
                {user?.fullName?.[0] ?? 'U'}
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                O que você está pensando, {user?.fullName?.split(' ')[0]}?
              </span>
            </button>
          )}

          {/* ── Marketplace carousel (only on geral tab, no search) ── */}
          {!q && tab === 'geral' && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: '#00c44f' }} />Marketplace
                </h2>
                <Link href="/marketplace" className="text-xs font-semibold flex items-center gap-0.5 hover:underline" style={{ color: '#00c44f' }}>
                  Ver mais <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {productsLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-44">
                      <ProductSk />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="card p-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Nenhum produto disponível ainda
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {products.map((p) => (
                    <Link key={p.id} href="/marketplace" className="flex-shrink-0 w-44 block">
                      <ProductCard product={p} compact />
                    </Link>
                  ))}
                  <Link href="/marketplace" className="flex-shrink-0 w-28 flex items-center justify-center card hover:bg-[#1a1a1a] transition-all">
                    <div className="text-center">
                      <ChevronRight className="w-5 h-5 mx-auto mb-1" style={{ color: '#00c44f' }} />
                      <span className="text-xs font-semibold" style={{ color: '#00c44f' }}>Ver tudo</span>
                    </div>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* ── Communities carousel (only on geral tab, no search) ── */}
          {!q && tab === 'geral' && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <Hash className="w-4 h-4" style={{ color: '#00c44f' }} />Comunidades
                </h2>
                <Link href="/communities" className="text-xs font-semibold flex items-center gap-0.5 hover:underline" style={{ color: '#00c44f' }}>
                  Ver mais <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {commLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[...Array(3)].map((_, i) => <div key={i} className="flex-shrink-0 w-64"><CommSk /></div>)}
                </div>
              ) : comms.length === 0 ? (
                <div className="card p-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhuma comunidade ainda</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {comms.map((c) => (
                    <div key={c.id} className="flex-shrink-0 w-72">
                      <CommunityCard community={c} />
                    </div>
                  ))}
                  <Link href="/communities" className="flex-shrink-0 w-28 flex items-center justify-center card hover:bg-[#1a1a1a] transition-all">
                    <div className="text-center">
                      <ChevronRight className="w-5 h-5 mx-auto mb-1" style={{ color: '#00c44f' }} />
                      <span className="text-xs font-semibold" style={{ color: '#00c44f' }}>Ver tudo</span>
                    </div>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* ── Map mini-widget (mobile only, collapsible) ── */}
          <div className="lg:hidden">
            <button
              onClick={() => setMapOpen(!mapOpen)}
              className="w-full card p-3 flex items-center justify-between hover:bg-[#1a1a1a] transition-all"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="w-4 h-4" style={{ color: '#00c44f' }} />
                Mapa do Campus UFAM
              </span>
              <ChevronRight className={cn('w-4 h-4 transition-transform', mapOpen && 'rotate-90')} style={{ color: 'rgba(255,255,255,0.35)' }} />
            </button>
            <AnimatePresence>
              {mapOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 280, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-b-2xl border-x border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <LeafletMap
                    blocks={mapBlocks as MapBlock[]}
                    selected={selectedBlock}
                    userPos={userPos}
                    onSelect={setSelectedBlock}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Posts list ── */}
          <div>
            {tab === 'seguindo' && (
              <p className="text-xs mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Posts de pessoas que você segue
              </p>
            )}

            {isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <PostSk key={i} />)}</div>
            ) : posts.length === 0 ? (
              <Empty
                icon={tab === 'seguindo' ? Users : Filter}
                title={q ? 'Nenhum resultado' : tab === 'seguindo' ? 'Nada por aqui ainda' : 'Nenhum post ainda'}
                description={
                  q ? 'Tente outros termos'
                  : tab === 'seguindo' ? 'Siga pessoas para ver os posts delas aqui'
                  : 'Seja o primeiro a postar!'
                }
                action={
                  tab === 'seguindo' ? (
                    <Link href="/communities" className="btn-green text-sm inline-flex">
                      <Hash className="w-4 h-4" />Explorar comunidades
                    </Link>
                  ) : isAuthenticated ? (
                    <button onClick={() => setCreateOpen(true)} className="btn-green text-sm">
                      <Plus className="w-4 h-4" />Criar post
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <motion.div className="space-y-3">
                {posts.map((p) => <PostCard key={p.id} post={p} onDelete={() => qc.resetQueries({ queryKey: ['feed'] })} />)}
                {hasNextPage && (
                  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                    className="btn-outline w-full justify-center py-3">
                    {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Right sidebar (desktop only) ── */}
        <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-4">

          {/* Map widget */}
          <div className="card overflow-hidden sticky top-20" style={{ height: 260 }}>
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: '#00c44f' }} />Campus UFAM
              </span>
              <Link href="/map" className="text-xs hover:underline" style={{ color: '#00c44f' }}>
                Expandir
              </Link>
            </div>
            <div style={{ height: 210 }}>
              <LeafletMap
                blocks={mapBlocks as MapBlock[]}
                selected={selectedBlock}
                userPos={userPos}
                onSelect={(b) => {
                  setSelectedBlock(b)
                }}
              />
            </div>
          </div>

          {/* Selected block info */}
          <AnimatePresence>
            {selectedBlock && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="card p-3"
                style={{ borderColor: 'rgba(0,196,79,0.2)', background: 'rgba(0,196,79,0.04)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{selectedBlock.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {selectedBlock.code} · {selectedBlock.floorCount} andares
                    </p>
                    {selectedBlock.description && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {selectedBlock.description}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedBlock(null)} className="btn-ghost p-1 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* UForum info card */}
          <div className="card p-4" style={{ background: 'rgba(0,196,79,0.04)', borderColor: 'rgba(0,196,79,0.12)' }}>
            <h3 className="font-bold text-sm mb-2">🎓 UForum</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              A rede social exclusiva da UFAM. Cadastre-se com seu email institucional.
            </p>
          </div>
        </aside>
      </div>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handlePostCreated}
      />
    </div>
  )
}
