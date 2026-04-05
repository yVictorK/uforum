'use client'
import { use, useState, useRef, useEffect } from 'react'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react'
import { PostCard } from '@/components/post/PostCard'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { PostSk, Empty, Sk } from '@/components/ui/index'
import { postsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import type { Post, Page } from '@/types'

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const focalRef = useRef<HTMLDivElement>(null)
  const [replyOpen, setReplyOpen] = useState(false)

  const { data: post, isLoading: pLoading, refetch: rPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id).then((r) => r.data),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: rLoading, refetch: rReplies } = useInfiniteQuery({
    queryKey: ['replies', id],
    queryFn: ({ pageParam = 0 }) => postsApi.getReplies(id, pageParam as number).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Post>) => last.last ? undefined : last.number + 1,
    enabled: !!post,
  })

  useEffect(() => {
    if (post && focalRef.current) {
      setTimeout(() => {
        focalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [post?.id])

  const replies = data?.pages.flatMap((p) => p.content) ?? []

  const refetchAll = () => { rPost(); rReplies() }

  const handlePostUpdate = () => {
    qc.invalidateQueries({ queryKey: ['feed'] })
    refetchAll()
  }

  return (
    <div className="page-wrap pt-12 pb-6 sm:py-6 max-w-3xl">
      <Link href="/feed" className="inline-flex items-center gap-2 text-sm mb-4 group pt-4" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Voltar
      </Link>

      {pLoading ? <PostSk /> : post ? (
        <div className="flex flex-col">
          {/* Ancentrais */}
          {post.ancestry && post.ancestry.length > 0 && (
            <div className="flex flex-col contents-thread">
              {post.ancestry[0].parentId && (
                <div className="relative mb-3">
                  <div className="absolute left-[1rem] top-6 bottom-[-0.5rem] w-[2px] rounded-full z-10"
                    style={{ background: 'var(--border-primary)', opacity: 0.5 }} />
                  <Link href={`/posts/${post.ancestry[0].parentId}`} className="text-[13px] font-bold pl-[2.25rem] hover:underline flex items-center" style={{ color: 'var(--emerald-500)' }}>
                    Ver contexto anterior...
                  </Link>
                </div>
              )}
              {post.ancestry.map((anc, idx) => (
                <div key={anc.id} className="relative">
                  <div className="absolute left-[1rem] top-8 bottom-[-0.5rem] w-[2px] rounded-full z-10"
                    style={{ background: 'var(--border-primary)', opacity: 0.5 }} />
                  <PostCard post={anc} variant="ancestor" compact onDelete={refetchAll} />
                </div>
              ))}
            </div>
          )}

          {/* Post Principal */}
          <div className="relative z-10">
            <PostCard ref={focalRef} post={post} isFocal onDelete={() => window.history.back()} showCommunity />
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Post não encontrado</div>
      )}

      {post && !post.isDeleted && (
        <div className="flex items-center justify-between my-5 px-1">
          <h2 className="font-bold flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <MessageSquare className="w-4 h-4" style={{ color: 'var(--emerald-500)' }} />
            {post.repliesCount} {post.repliesCount === 1 ? 'resposta' : 'respostas'}
          </h2>
          {isAuthenticated && (
            <button onClick={() => setReplyOpen(true)} className="btn-green text-sm py-2">
              <Plus className="w-4 h-4" />Responder
            </button>
          )}
        </div>
      )}

      {rLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSk key={i} />)}</div>
      ) : replies.length === 0 ? (
        post && !post.isDeleted && (
          <Empty icon={MessageSquare} title="Nenhuma resposta" description="Seja o primeiro!"
            action={isAuthenticated ? (
              <button onClick={() => setReplyOpen(true)} className="btn-green text-sm">
                <Plus className="w-4 h-4" />Responder
              </button>
            ) : undefined} />
        )
      ) : (
        <div className="space-y-3">
          {replies.map((r) => (
            <ReplyThread key={r.id} reply={r} depth={0} onDelete={handlePostUpdate} />
          ))}
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-outline w-full justify-center py-3">
              {isFetchingNextPage ? 'Carregando...' : 'Mais'}
            </button>
          )}
        </div>
      )}

      <CreatePostModal open={replyOpen} onClose={() => setReplyOpen(false)} parentId={id} onSuccess={handlePostUpdate} />
    </div>
  )
}

function ReplyThread({ reply, depth, onDelete }: { reply: Post; depth: number; onDelete: () => void }) {
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [nestedOpen, setNestedOpen] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reply-replies', reply.id],
    queryFn: () => postsApi.getReplies(reply.id, 0).then((r) => r.data),
    enabled: showReplies,
  })
  const nested: Post[] = data?.content ?? []

  const handleReplyDelete = () => {
    refetch()
    onDelete()
    qc.invalidateQueries({ queryKey: ['feed'] })
  }

  return (
    <div className={cn('relative', depth > 0 ? 'ml-4' : '')}>
      {depth > 0 && (
        <div className="absolute left-[-0.7rem] top-0 bottom-0 w-[2px] rounded-full"
          style={{ background: 'var(--border-primary)', opacity: 0.3 }} />
      )}
      <PostCard 
        post={reply} 
        variant="comment" 
        showCommunity={false} 
        onDelete={handleReplyDelete} 
        onReply={depth < 4 && isAuthenticated ? () => setNestedOpen(true) : undefined} 
      />
      
      {reply.repliesCount > 0 && depth < 4 && (
        <button onClick={() => setShowReplies(!showReplies)}
          className="ml-4 mt-1 mb-2 text-[13px] flex items-center gap-1 font-semibold"
          style={{ color: 'var(--emerald-500)' }}>
          <MessageSquare className="w-3.5 h-3.5" />
          {showReplies ? 'Ocultar' : `Ver ${reply.repliesCount} resposta${reply.repliesCount > 1 ? 's' : ''}`}
        </button>
      )}

      {reply.repliesCount > 0 && depth >= 4 && (
        <Link href={`/posts/${reply.id}`} className="ml-4 mt-1 mb-2 text-[13px] flex items-center gap-1 font-bold" style={{ color: 'var(--emerald-500)' }}>
          Continuar esta thread →
        </Link>
      )}

      {showReplies && depth < 4 && (
        <div className="mt-1 space-y-2">
          {isLoading ? <Sk className="h-20 rounded-xl ml-4" /> : nested.map((r) => (
            <ReplyThread key={r.id} reply={r} depth={depth + 1} onDelete={() => { refetch(); onDelete() }} />
          ))}
        </div>
      )}

      {isAuthenticated && (
        <CreatePostModal open={nestedOpen} onClose={() => setNestedOpen(false)} parentId={reply.id}
          onSuccess={() => {
            setNestedOpen(false)
            setShowReplies(true)
            refetch()
            onDelete()
          }} />
      )}
    </div>
  )
}
