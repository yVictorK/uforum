'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, BookmarkCheck, Share2, MoreHorizontal, Trash2, Flag, Heart } from 'lucide-react'
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
  onReply?: () => void
  compact?: boolean
  showCommunity?: boolean
  variant?: 'default' | 'comment' | 'ancestor'
  isFocal?: boolean
}

import { forwardRef } from 'react'

export const PostCard = forwardRef<HTMLDivElement, Props>(({ post, onDelete, onReply, compact = false, showCommunity = true, variant = 'default', isFocal = false }, ref) => {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)

  const updatePostCache = (updatedPost: Post) => {
    qc.setQueryData(['post', updatedPost.id], (old: any) => {
      if (!old) return undefined // Don't create entries from partial responses (no ancestry)
      return { ...updatedPost, ancestry: (old.ancestry?.length ? old.ancestry : updatedPost.ancestry) }
    })

    const updateList = (prefix: string) => {
      qc.setQueriesData({ queryKey: [prefix] }, (old: any) => {
        if (!old || !old.pages) return old
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            content: p.content.map((item: Post) => 
              item.id === updatedPost.id ? { ...updatedPost, ancestry: item.ancestry || updatedPost.ancestry } : item
            )
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
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'
  const score = post.upvotesCount - post.downvotesCount

  if (variant === 'comment' || variant === 'ancestor') {
    return (
      <article ref={ref} className="group flex gap-2">
        <div className="flex flex-col items-center pt-1 w-8 flex-shrink-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.profilePictureUrl} name={post.author.fullName} size="xs" />
          </Link>
        </div>
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-1.5 text-[13px] mb-1">
            <Link href={`/profile/${post.author.username}`} className="font-bold text-[14px] hover:underline" style={{ color: 'var(--text-primary)' }}>
              {post.author.fullName}
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>• {timeAgo(post.createdAt)}</span>
            <div className="relative ml-auto">
              <button onClick={() => setMenu(!menu)} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-lg z-20 overflow-hidden py-1"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-liquid-hover)' }}>
                    {(isOwner || isAdmin) && (
                      <button onClick={() => { del(); setMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#ef4444]/10 transition-colors text-left" style={{ color: '#ef4444' }}>
                        <Trash2 className="w-3.5 h-3.5" />Deletar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <Link href={`/posts/${post.id}`} className="block mt-0.5">
            {post.title && <h3 className="font-bold text-[15px] mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>}
            <p className={cn('text-[15px] leading-relaxed', compact ? 'line-clamp-2' : '')}
              style={{ color: post.isDeleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              {post.isDeleted ? '[removido]' : post.content}
            </p>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              <button
                onClick={() => vote('UPVOTE')}
                className={cn('p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors', post.currentUserVote === 'UPVOTE' ? 'text-[var(--emerald-500)]' : 'text-[#d1d5db]')}>
                <Heart className="w-4 h-4" fill={post.currentUserVote === 'UPVOTE' ? 'currentColor' : 'transparent'} />
              </button>
              <span className="text-xs font-bold px-1 text-center" style={{ color: score > 0 ? 'var(--emerald-500)' : score < 0 ? '#ef4444' : 'var(--text-primary)' }}>{score !== 0 ? score : ''}</span>
              <button
                onClick={() => vote('DOWNVOTE')}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors">
                <img
                  src={post.currentUserVote === 'DOWNVOTE' ? '/icons/dislike-active.svg' : '/icons/dislike-normal.svg'}
                  alt="Dislike"
                  className="w-5 h-5 object-contain"
                />
              </button>
            </div>

            <div className="relative">
              {onReply ? (
                <button onClick={onReply} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--bg-secondary)] text-[13px] font-semibold transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Responder {post.repliesCount > 0 && <span className="opacity-80">({post.repliesCount})</span>}
                </button>
              ) : (
                <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--bg-secondary)] text-[13px] font-semibold transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Responder {post.repliesCount > 0 && <span className="opacity-80">({post.repliesCount})</span>}
                </Link>
              )}
            </div>


          </div>
        </div>
      </article>
    )
  }

  return (
    <motion.article ref={ref} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group transition-all',
        !isFocal && 'card hover:border-[var(--emerald-500)]/30 hover:bg-[var(--bg-tertiary)]',
        isFocal ? 'py-5' : (compact ? 'p-4' : 'p-5')
      )}>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.profilePictureUrl} name={post.author.fullName} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author.username}`}
                className="font-semibold text-[15px] hover:text-[var(--emerald-500)] transition-colors truncate"
                style={{ color: 'var(--text-primary)' }}>
                {post.author.fullName}
              </Link>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>
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

      <Link href={`/posts/${post.id}`} className="block mt-1">
        {post.title && (
          <h3 className={cn("font-bold mb-1.5 leading-snug hover:text-[var(--emerald-500)] transition-colors", isFocal ? "text-[22px] font-extrabold" : "text-[17px] line-clamp-2")} style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h3>
        )}
        <p className={cn('leading-relaxed', compact ? 'line-clamp-2' : (isFocal ? '' : 'line-clamp-4'), isFocal ? 'text-[17px] mt-4' : 'text-[15px]')}
          style={{ color: post.isDeleted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
          {post.isDeleted ? '[post removido]' : post.content}
        </p>
      </Link>

      {post.imageUrl && !compact && (
        <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
          <img src={post.imageUrl} alt="Post" className="w-full max-h-72 object-cover" />
        </div>
      )}

      {true && (
        <>
          <div className={cn("flex items-center gap-1", isFocal ? 'mt-2 mb-2' : 'mt-4')}>
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
              <button onClick={() => vote('UPVOTE')}
                className={cn('vote-btn', post.currentUserVote === 'UPVOTE' ? 'text-[var(--emerald-500)]' : 'text-[#d1d5db]')}>
                <Heart className="w-4 h-4" fill={post.currentUserVote === 'UPVOTE' ? 'currentColor' : 'transparent'} />
                <span>{fmtNum(post.upvotesCount)}</span>
              </button>
              <div className="w-px h-5" style={{ background: 'var(--border-primary)' }} />
              <button onClick={() => vote('DOWNVOTE')}
                className="vote-btn hover:bg-[var(--bg-primary)] px-2 h-full flex items-center justify-center">
                <img
                  src={post.currentUserVote === 'DOWNVOTE' ? '/icons/dislike-active.svg' : '/icons/dislike-normal.svg'}
                  alt="Dislike"
                  className="w-5 h-5 object-contain"
                />
                <span className="ml-1">{fmtNum(post.downvotesCount)}</span>
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
        </>
      )}
    </motion.article>
  )
})

