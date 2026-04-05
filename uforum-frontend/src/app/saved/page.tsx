'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import { Empty, PostSk } from '@/components/ui/index'
import { PostCard } from '@/components/post/PostCard'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/lib/api'
import type { Post, Page } from '@/types'

export default function SavedPage() {
  const { isAuthenticated } = useAuthStore()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['saved-posts'],
    queryFn: ({ pageParam = 0 }) => usersApi.getSaved(pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: isAuthenticated,
  })

  const posts = data?.pages.flatMap((p) => p.content) ?? []

  if (!isAuthenticated) return (
    <div className="page-wrap py-16 text-center">
      <BookmarkCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
      <p className="mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Faça login para ver seus posts salvos</p>
      <Link href="/auth/login" className="btn-green inline-flex">Entrar</Link>
    </div>
  )

  return (
    <div className="page-wrap py-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <BookmarkCheck className="w-6 h-6" style={{ color: '#00c44f' }} />Posts Salvos
      </h1>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
      ) : posts.length === 0 ? (
        <Empty icon={BookmarkCheck} title="Nenhum post salvo" description="Clique no ícone de bookmark em qualquer post para salvar."
          action={<Link href="/feed" className="btn-green text-sm inline-flex">Explorar feed</Link>} />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => <PostCard key={p.id} post={p} onDelete={() => refetch()} />)}
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
              className="btn-outline w-full justify-center py-3">
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
