'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, reportsApi, adminApi } from '@/lib/api'
import { PostCard } from '@/components/post/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { Sk, Modal } from '@/components/ui/index'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ChevronDown, ChevronUp, Trash2, Ban, CheckCircle, AlertTriangle } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Report {
  id: string
  reporter: any
  targetId: string
  targetType: string
  reason: string
  description: string
  status: string
  createdAt: string
}

export function ReportRow({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false)
  const [isBanOpen, setIsBanOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const qc = useQueryClient()

  const { data: post, isLoading: loadingPost, error: postError } = useQuery({
    queryKey: ['post-detail', report.targetId],
    queryFn: () => postsApi.get(report.targetId).then(r => r.data),
    enabled: expanded && report.targetType === 'POST'
  })

  const { mutate: resolveOnly } = useMutation({
    mutationFn: () => reportsApi.resolve(report.id, 'RESOLVED', 'Ignorado pelo moderador'),
    onSuccess: () => {
      toast.success('Denúncia ignorada')
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
    }
  })

  const { mutate: deleteAndResolve } = useMutation({
    mutationFn: async () => {
      await postsApi.delete(report.targetId)
      await reportsApi.resolve(report.id, 'RESOLVED', 'Conteúdo removido pelo moderador')
    },
    onSuccess: () => {
      toast.success('Post removido e denúncia resolvida')
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
      setIsDelOpen(false)
    },
    onError: () => toast.error('Erro ao processar ação')
  })

  const { mutate: banAndResolve } = useMutation({
    mutationFn: async () => {
      if (!post?.author?.id) throw new Error('No author')
      await adminApi.toggleStatus(post.author.id)
      await reportsApi.resolve(report.id, 'RESOLVED', 'Usuário banido pelo moderador')
    },
    onSuccess: () => {
      toast.success('Usuário banido e denúncia resolvida')
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
      setIsBanOpen(false)
    },
    onError: () => toast.error('Erro ao processar ação')
  })

  const reasonLabels: Record<string, string> = {
    'SPAM': 'Spam',
    'HARASSMENT': 'Assédio',
    'HATE_SPEECH': 'Ódio',
    'INAPPROPRIATE': 'Impróprio',
    'MISINFORMATION': 'Fake News',
    'OTHER': 'Outro'
  }

  return (
    <>
      <div style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div 
          className="group flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors"
          style={{ background: expanded ? 'var(--bg-secondary)' : 'transparent' }}
          onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = 'var(--bg-secondary)' }}
          onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent' }}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="badge bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                {reasonLabels[report.reason] || report.reason}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>• Denunciado por</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>@{report.reporter.username}</span>
            </div>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
              {report.description || 'Nenhuma descrição adicional.'}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{fmtDate(report.createdAt)}</p>
            {expanded
              ? <ChevronUp className="w-4 h-4 ml-auto opacity-50" style={{ color: 'var(--text-muted)' }} />
              : <ChevronDown className="w-4 h-4 ml-auto opacity-50" style={{ color: 'var(--text-muted)' }} />
            }
          </div>
        </div>

        {expanded && (
          <div className="px-6 py-5 animate-in slide-in-from-top-1 duration-200" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Conteúdo Denunciado</h4>
                {loadingPost ? (
                  <div className="space-y-3 p-4 card opacity-50">
                    <div className="flex gap-3"><Sk className="w-8 h-8 rounded-full" /><Sk className="h-4 w-24" /></div>
                    <Sk className="h-4 w-full" /><Sk className="h-4 w-3/4" />
                  </div>
                ) : postError ? (
                  <div className="p-8 text-center card" style={{ borderStyle: 'dashed', borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Post não encontrado ou já deletado.</p>
                  </div>
                ) : (
                  <div className="pointer-events-none opacity-90 scale-[0.98] origin-top border rounded-2xl overflow-hidden" 
                       style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                    <PostCard post={post} />
                  </div>
                )}
              </div>

              <div className="lg:w-64 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ações de Moderação</h4>
                <div className="space-y-2">
                  <button onClick={() => resolveOnly()}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Ignorar Denúncia
                  </button>
                  <button onClick={() => setIsDelOpen(true)} disabled={!!postError}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-sm font-semibold transition-all disabled:opacity-30">
                    <Trash2 className="w-4 h-4" /> Remover Post
                  </button>
                  <button onClick={() => setIsBanOpen(true)} disabled={!!postError}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 text-sm font-semibold transition-all shadow-lg shadow-rose-900/10 disabled:opacity-30">
                    <Ban className="w-4 h-4" /> Banir Autor
                  </button>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                  <p className="text-[10px] leading-relaxed uppercase font-bold tracking-widest mb-1 italic" style={{ color: 'var(--text-muted)' }}>Dica de Segurança</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Banir o autor removerá o acesso dele à plataforma imediatamente.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={() => deleteAndResolve()}
        loading={false}
        title="Remover Conteúdo"
        description="Este post será deletado permanentemente e a denúncia será arquivada como resolvida."
        confirmText="Sim, Remover"
      />

      <ConfirmModal 
        isOpen={isBanOpen}
        onClose={() => setIsBanOpen(false)}
        onConfirm={() => banAndResolve()}
        loading={false}
        title="Banir Usuário"
        description={post?.author ? `Deseja banir @${post.author.username} permanentemente?` : 'Deseja banir o autor deste post?'}
        confirmText="Sim, Banir Usuário"
      />
    </>
  )
}
