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

export function PostCard({ post: init, onDelete, compact = false, showCommunity = true }: Props) {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [post, setPost] = useState(init)
  // Sync with parent when post data updates (e.g. after feed refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPost(init) }, [init.id, init.upvotesCount, init.downvotesCount, init.isSaved])
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)

  const vote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isAuthenticated) { toast.error('Faça login para votar'); return }
    if (busy) return
    setBusy(true)
    try { const { data } = await postsApi.vote(post.id, type); setPost(data); qc.setQueryData(['post', post.id], data) }
    catch { toast.error('Erro ao votar') }
    finally { setBusy(false) }
  }

  const save = async () => {
    if (!isAuthenticated) { toast.error('Faça login para salvar'); return }
    try {
      const { data } = await postsApi.save(post.id)
      setPost(data)
      toast.success(data.isSaved ? 'Post salvo!' : 'Removido dos salvos')
    } catch { toast.error('Erro') }
  }

  const del = async () => {
    if (!confirm('Deletar este post?')) return
    try { await postsApi.delete(post.id); toast.success('Post deletado'); onDelete?.() }
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
      className={cn('card group transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1a1a1a]', compact ? 'p-4' : 'p-5')}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.profilePictureUrl} name={post.author.fullName} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author.username}`}
                className="font-semibold text-sm hover:text-[#00c44f] transition-colors truncate">
                {post.author.fullName}
              </Link>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{timeAgo(post.createdAt)}</span>
              {showCommunity && post.communityName && (
                <>
                  <span>·</span>
                  <Link href={`/communities/${post.communitySlug}`} className="text-[#00c44f] hover:underline font-medium">
                    {post.communityName}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setMenu(!menu)}
            className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 rounded-lg transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl z-20 overflow-hidden py-1"
                style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
                <button onClick={() => { share(); setMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#2a2a2a] transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Share2 className="w-3.5 h-3.5" />Compartilhar
                </button>
                {(isOwner || isAdmin) && (
                  <button onClick={() => { del(); setMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgba(255,69,69,0.1)] transition-colors text-left"
                    style={{ color: '#ff6b6b' }}>
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#2a2a2a] transition-colors text-left"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Flag className="w-3.5 h-3.5" />Denunciar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/posts/${post.id}`} className="block">
        {post.title && (
          <h3 className="font-bold text-base mb-1.5 leading-snug hover:text-[#00c44f] transition-colors line-clamp-2">
            {post.title}
          </h3>
        )}
        <p className={cn('text-sm leading-relaxed', compact ? 'line-clamp-2' : 'line-clamp-4')}
          style={{ color: post.isDeleted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
          {post.isDeleted ? '[post removido]' : post.content}
        </p>
      </Link>

      {/* Image */}
      {post.imageUrl && !compact && (
        <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="Post" className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-4">
        {/* Vote */}
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          <button onClick={() => vote('UPVOTE')}
            className={cn('vote-btn', post.currentUserVote === 'UPVOTE' && 'vote-up-active')}>
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{fmtNum(post.upvotesCount)}</span>
          </button>
          <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <button onClick={() => vote('DOWNVOTE')}
            className={cn('vote-btn', post.currentUserVote === 'DOWNVOTE' && 'vote-down-active')}>
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{fmtNum(post.downvotesCount)}</span>
          </button>
        </div>

        {/* Score indicator */}
        {score !== 0 && (
          <span className="text-xs font-semibold px-2" style={{ color: score > 0 ? '#00c44f' : '#ff6b6b' }}>
            {score > 0 ? '+' : ''}{fmtNum(score)}
          </span>
        )}

        {/* Replies */}
        <Link href={`/posts/${post.id}`}
          className="vote-btn ml-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{fmtNum(post.repliesCount)}</span>
        </Link>

        {/* Save */}
        <button onClick={save}
          className={cn('vote-btn', post.isSaved && 'text-[#00c44f]')}
          style={post.isSaved ? { color: '#00c44f' } : {}}>
          {post.isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Share */}
        <button onClick={share} className="vote-btn">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.article>
  )
}
