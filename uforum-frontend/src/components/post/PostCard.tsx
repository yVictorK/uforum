'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, BookmarkCheck, Share2, MoreHorizontal, Trash2, Flag } from 'lucide-react'
import { cn, timeAgo, fmtNum } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/auth'
import { postsApi, reportsApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import type { Post } from '@/types'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Props {
  post: Post
  onDelete?: () => void
  compact?: boolean
  showCommunity?: boolean
}

export function PostCard({ post, onDelete, compact = false, showCommunity = true }: Props) {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)

  const updatePostCache = (updatedPost: Post) => {
    qc.setQueryData(['post', updatedPost.id], updatedPost)

    const updateList = (prefix: string) => {
      qc.setQueriesData({ queryKey: [prefix] }, (old: any) => {
        if (!old || !old.pages) return old
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            content: p.content.map((item: Post) => item.id === updatedPost.id ? updatedPost : item)
          }))
        }
      })
    }

    updateList('feed')
    updateList('replies')
    updateList('reply-replies')
    updateList('u-posts')
    updateList('c-posts')
    updateList('saved-posts')
  }

  const vote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isAuthenticated) { toast.error('Faça login para votar'); return }
    if (busy) return
    setBusy(true)
    try {
      const { data } = await postsApi.vote(post.id, type)
      updatePostCache(data)
    }
    catch { toast.error('Erro ao votar') }
    finally { setBusy(false) }
  }

  const save = async () => {
    if (!isAuthenticated) { toast.error('Faça login para salvar'); return }
    try {
      const { data } = await postsApi.save(post.id)
      updatePostCache(data)
      toast.success(data.isSaved ? 'Post salvo!' : 'Removido dos salvos')

      // If we are unsaving and on the saved page, we want it to vanish, so we tell React Query to fetch fresh data for saved-posts
      if (!data.isSaved && window.location.pathname === '/saved') {
        qc.invalidateQueries({ queryKey: ['saved-posts'] })
      }
    } catch { toast.error('Erro ao salvar') }
  }

  const del = async () => {
    if (!confirm('Deletar este post?')) return
    try {
      await postsApi.delete(post.id)
      toast.success('Post deletado')

      // Se for uma resposta, invalida o cache do post pai para atualizar o contador
      if (post.parentId) {
        qc.invalidateQueries({ queryKey: ['post', post.parentId] })
        qc.invalidateQueries({ queryKey: ['replies', post.parentId] })
      }

      onDelete?.()
    }
    catch { toast.error('Erro ao deletar') }
  }

  const share = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
    toast.success('Link copiado!')
  }

  const isOwner = user?.id === post.author.id
  const isAdmin = user?.role === 'ADMIN'
  const score = post.upvotesCount - post.downvotesCount

  return (
    <motion.article initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={cn('card group hover:border-[var(--emerald-500)]/30 hover:bg-[var(--bg-tertiary)]', compact ? 'p-4' : 'p-5')}>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.profilePictureUrl} name={post.author.fullName} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author.username}`}
                className="font-semibold text-sm hover:text-[var(--emerald-500)] transition-colors truncate"
                style={{ color: 'var(--text-primary)' }}>
                {post.author.fullName}
              </Link>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{timeAgo(post.createdAt)}</span>
              {showCommunity && post.communityName && (
                <>
                  <span>·</span>
                  <Link href={`/communities/${post.communitySlug}`} className="text-[var(--emerald-500)] hover:underline font-semibold">
                    {post.communityName}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button onClick={() => setMenu(!menu)}
            className="btn-ghost p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl z-20 overflow-hidden py-1"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-liquid-hover)' }}>
                <button onClick={() => { share(); setMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Share2 className="w-3.5 h-3.5" />Compartilhar
                </button>
                {(isOwner || isAdmin) && (
                  <button onClick={() => { del(); setMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#ef4444]/10 transition-colors text-left"
                    style={{ color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" />Deletar
                  </button>
                )}
                {!isOwner && (
                  <button onClick={() => {
                    setMenu(false)
                    if (!isAuthenticated) { toast.error('Faça login para denunciar'); return }
                    const reason = prompt('Motivo: SPAM, HARASSMENT, HATE_SPEECH, INAPPROPRIATE, MISINFORMATION, OTHER')
                    if (!reason) return
                    reportsApi.create({ targetId: post.id, targetType: 'POST', reason: reason.toUpperCase(), description: '' })
                      .then(() => toast.success('Denúncia enviada!'))
                      .catch(() => toast.error('Erro ao denunciar'))
                  }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors text-left"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Flag className="w-3.5 h-3.5" />Denunciar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Link href={`/posts/${post.id}`} className="block">
        {post.title && (
          <h3 className="font-bold text-base mb-1.5 leading-snug hover:text-[var(--emerald-500)] transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h3>
        )}
        <p className={cn('text-sm leading-relaxed', compact ? 'line-clamp-2' : 'line-clamp-4')}
          style={{ color: post.isDeleted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
          {post.isDeleted ? '[post removido]' : post.content}
        </p>
      </Link>

      {post.imageUrl && !compact && (
        <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
          <img src={post.imageUrl} alt="Post" className="w-full max-h-72 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1 mt-4">
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <button onClick={() => vote('UPVOTE')}
            className={cn('vote-btn', post.currentUserVote === 'UPVOTE' && 'vote-up-active')}>
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{fmtNum(post.upvotesCount)}</span>
          </button>
          <div className="w-px h-5" style={{ background: 'var(--border-primary)' }} />
          <button onClick={() => vote('DOWNVOTE')}
            className={cn('vote-btn', post.currentUserVote === 'DOWNVOTE' && 'vote-down-active')}>
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{fmtNum(post.downvotesCount)}</span>
          </button>
        </div>

        {score !== 0 && (
          <span className="text-xs font-bold px-2" style={{ color: score > 0 ? 'var(--emerald-500)' : '#ef4444' }}>
            {score > 0 ? '+' : ''}{fmtNum(score)}
          </span>
        )}

        <Link href={`/posts/${post.id}`}
          className="vote-btn ml-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{fmtNum(post.repliesCount)}</span>
        </Link>

        <button onClick={save}
          className={cn('vote-btn', post.isSaved && 'text-[var(--emerald-500)]')}
          style={post.isSaved ? { color: 'var(--emerald-500)' } : {}}>
          {post.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        <button onClick={share} className="vote-btn">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.article>
  )
}
