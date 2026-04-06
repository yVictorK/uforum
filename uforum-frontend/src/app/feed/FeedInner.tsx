'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Globe, Users, Filter, ChevronRight, ShoppingBag, Hash, MapPin, X, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PostCard } from '@/components/post/PostCard'
import { CommunityCard } from '@/components/community/CommunityCard'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { EventCard } from '@/components/event/EventCard'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { PostSk, CommSk, ProductSk, Empty } from '@/components/ui/index'
import { postsApi, communitiesApi, marketplaceApi, mapApi, eventsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import type { Post, Page, Community, Product, MapBlock, Event } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--emerald-500)', borderTopColor: 'transparent' }} />
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
      () => { }
    )
  }, [])

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

  const handlePostCreated = () => {
    qc.resetQueries({ queryKey: ['feed'] })
  }

  const { data: commData, isLoading: commLoading } = useQuery({
    queryKey: ['comms-search', q],
    queryFn: () => communitiesApi.list(0, q).then((r) => r.data),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['marketplace-search', q],
    queryFn: () => marketplaceApi.list(0, q).then((r) => r.data),
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events-search', q],
    queryFn: () => eventsApi.list(0, q).then((r) => r.data),
    enabled: !!q,
  })

  const { data: mapBlocks = [] } = useQuery({
    queryKey: ['map-blocks'],
    queryFn: () => mapApi.listBlocks().then((r) => r.data),
  })

  const posts = data?.pages.flatMap((p) => p.content) ?? []
  const comms: Community[] = q ? (commData?.content ?? []) : (commData?.content?.slice(0, 4) ?? [])
  const products: Product[] = q ? (productsData?.content ?? []) : (productsData?.content?.slice(0, 6) ?? [])
  const events: Event[] = eventsData?.content ?? []

  const isSearchEmpty = q && posts.length === 0 && comms.length === 0 && products.length === 0 && events.length === 0

  return (
    <div className="page-wrap pt-5 pb-6 sm:py-6">
      <div className="flex gap-6">

        <div className="flex-1 min-w-0 space-y-4">

          {q && (
            <div className="mb-2">
              <h1 className="font-bold text-lg">Busca: <span style={{ color: 'var(--emerald-500)' }}>&ldquo;{q}&rdquo;</span></h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {posts.length + comms.length + products.length + events.length} resultados encontrados
              </p>
            </div>
          )}

          {!q && (
            <div className="lg:hidden rounded-2xl overflow-hidden border mb-4" style={{ borderColor: 'var(--border-primary)', height: 240 }}>
              <LeafletMap
                blocks={mapBlocks as MapBlock[]}
                selected={selectedBlock}
                userPos={userPos}
                onSelect={setSelectedBlock}
                showExpandButton
              />
            </div>
          )}


          {!q && (
            <div className="flex items-center justify-between">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <button onClick={() => setTab('geral')}
                  className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all')}
                  style={tab === 'geral' ? { background: 'var(--emerald-500)', color: '#fff' } : { color: 'var(--text-muted)' }}>
                  <Globe className="w-3.5 h-3.5" />Geral
                </button>
                <button onClick={() => {
                  if (!isAuthenticated) { toast.error('Faça login para ver o feed de seguidos'); return }
                  setTab('seguindo')
                }}
                  className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all')}
                  style={tab === 'seguindo' ? { background: 'var(--emerald-500)', color: '#fff' } : { color: 'var(--text-muted)' }}>
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

          {q && (
            <div className="space-y-8">
              {comms.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Hash className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />Comunidades
                    </h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {comms.map((c) => (
                      <div key={c.id} className="flex-shrink-0 w-72">
                        <CommunityCard community={c} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {events.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <CalendarDays className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />Eventos
                    </h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {events.map((e) => (
                      <div key={e.id} className="flex-shrink-0 w-72">
                        <EventCard event={e} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {products.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <ShoppingBag className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />Marketplace
                    </h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {products.map((p) => (
                      <Link key={p.id} href="/marketplace" className="flex-shrink-0 w-44 block">
                        <ProductCard product={p} compact />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {posts.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Posts</h2>
                  <motion.div className="space-y-3">
                    {posts.map((p) => <PostCard key={p.id} post={p} onDelete={() => qc.resetQueries({ queryKey: ['feed'] })} />)}
                    {hasNextPage && (
                      <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                        className="btn-outline w-full justify-center py-3">
                        {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
                      </button>
                    )}
                  </motion.div>
                </section>
              )}

              {isSearchEmpty && (
                <Empty
                  icon={Filter}
                  title="Nenhum resultado"
                  description="Tente outros termos de pesquisa"
                />
              )}
            </div>
          )}

          {!q && (
            <>
              {isAuthenticated && (
                <button onClick={() => setCreateOpen(true)}
                  className="card w-full p-4 flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-all text-left">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'var(--emerald-500)', color: '#fff' }}>
                    {user?.fullName?.[0] ?? 'U'}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    O que você está pensando, {user?.fullName?.split(' ')[0]}?
                  </span>
                </button>
              )}

              {tab === 'geral' && (
                <>
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <ShoppingBag className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />Marketplace
                      </h2>
                      <Link href="/marketplace" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: 'var(--emerald-500)' }}>
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
                      <div className="card p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Nenhum produto disponível ainda
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {products.map((p) => (
                          <Link key={p.id} href="/marketplace" className="flex-shrink-0 w-44 block">
                            <ProductCard product={p} compact />
                          </Link>
                        ))}
                        <Link href="/marketplace" className="flex-shrink-0 w-28 flex items-center justify-center card hover:bg-[var(--bg-secondary)] transition-all">
                          <div className="text-center">
                            <ChevronRight className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--emerald-500)' }} />
                            <span className="text-xs font-semibold" style={{ color: 'var(--emerald-500)' }}>Ver tudo</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Hash className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />Comunidades
                      </h2>
                      <Link href="/communities" className="text-xs font-semibold flex items-center gap-0.5 hover:underline" style={{ color: 'var(--emerald-500)' }}>
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
                        <Link href="/communities" className="flex-shrink-0 w-28 flex items-center justify-center card hover:bg-[var(--bg-secondary)] transition-all">
                          <div className="text-center">
                            <ChevronRight className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--emerald-500)' }} />
                            <span className="text-xs font-semibold" style={{ color: 'var(--emerald-500)' }}>Ver tudo</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </section>
                </>
              )}

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
                    title={tab === 'seguindo' ? 'Nada por aqui ainda' : 'Nenhum post ainda'}
                    description={
                      tab === 'seguindo' ? 'Siga pessoas para ver os posts delas aqui' : 'Seja o primeiro a postar!'
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
            </>
          )}
        </div>

        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <span className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--emerald-500)' }} />Campus UFAM
                </span>
                <Link href="/map" className="text-xs font-semibold" style={{ color: 'var(--emerald-500)' }}>
                  Expandir
                </Link>
              </div>
              <div style={{ height: 210 }}>
                <LeafletMap
                  blocks={mapBlocks as MapBlock[]}
                  selected={selectedBlock}
                  userPos={userPos}
                  onSelect={(b) => setSelectedBlock(b)}
                  showExpandButton
                />
              </div>
            </div>

            <AnimatePresence>
              {selectedBlock && (
                <motion.div
                  key="selected-block"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="card p-3 border shadow-lg"
                  style={{ borderColor: 'var(--emerald-500)', background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedBlock.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {selectedBlock.code} · {selectedBlock.floorCount} andares
                      </p>
                      {selectedBlock.description && (
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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

            <div className="card p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>🎓 UForum</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                A rede social exclusiva da UFAM. Cadastre-se com seu email institucional.
              </p>
            </div>
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
