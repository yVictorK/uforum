'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageIcon, Link2, Users } from 'lucide-react'
import { Modal } from '@/components/ui/index'
import { postsApi, communitiesApi } from '@/lib/api'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import toast from 'react-hot-toast'
import type { Community } from '@/types'

const schema = z.object({
  title: z.string().max(300).optional(),
  content: z.string().min(1, 'Escreva algo').max(10000),
  communityId: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean; onClose: () => void
  communityId?: string; parentId?: string; onSuccess?: () => void
}

export function CreatePostModal({ open, onClose, communityId, parentId, onSuccess }: Props) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'text' | 'image'>('text')
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { communityId }
  })

  const { data: myCommsData } = useQuery({
    queryKey: ['my-communities'],
    queryFn: () => communitiesApi.getMyCommunities(0).then((r) => r.data),
    enabled: !communityId && !parentId && open,
  })
  const myCommunities: Community[] = myCommsData?.content ?? []
  const contentLen = (watch('content') ?? '').length

  const onSubmit = async (data: FormData) => {
    try {
      await postsApi.create({
        ...data,
        communityId: communityId || data.communityId || undefined,
        parentId: parentId || undefined,
        imageUrl: data.imageUrl || undefined,
      })
      toast.success(parentId ? 'Resposta publicada!' : 'Post publicado!')
      await qc.invalidateQueries({ queryKey: ['feed'] })
      await qc.invalidateQueries({ queryKey: ['community-posts'] })
      await qc.invalidateQueries({ queryKey: ['replies'] })
      reset(); onClose(); onSuccess?.()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Erro ao publicar')
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title={parentId ? 'Responder' : 'Criar Post'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.profilePictureUrl} name={user?.fullName ?? 'U'} size="md" />
          <div>
            <p className="font-semibold text-sm">{user?.fullName}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{user?.username}</p>
          </div>
        </div>

        {!communityId && !parentId && (
          <div>
            <label className="label flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />Comunidade
            </label>
            {myCommunities.length === 0 ? (
              <div className="input text-sm italic" style={{ color: 'var(--text-muted)' }}>
                Entre em uma comunidade para poder postar nela
              </div>
            ) : (
              <select {...register('communityId')} className="input">
                <option value="">Sem comunidade</option>
                {myCommunities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {!parentId && (
          <div>
            <label className="label">Título (opcional)</label>
            <input {...register('title')} placeholder="Dê um título ao seu post..." className="input" />
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {[['text', 'Texto'], ['image', 'Imagem']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k as 'text' | 'image')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === k
                ? { background: 'var(--emerald-500)', color: '#fff' }
                : { color: 'var(--text-muted)' }}>
              {k === 'image' && <ImageIcon className="w-3.5 h-3.5" />}{l}
            </button>
          ))}
        </div>

        <div>
          <textarea {...register('content')} placeholder={parentId ? 'Escreva sua resposta...' : 'O que você está pensando?'}
            rows={5} className="input resize-none" />
          <div className="flex justify-between mt-1">
            {errors.content && <p className="text-xs text-[#ef4444] font-medium">{errors.content.message}</p>}
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{contentLen}/10000</span>
          </div>
        </div>

        {tab === 'image' && (
          <div>
            <label className="label flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />URL da imagem</label>
            <input {...register('imageUrl')} placeholder="https://..." className="input" />
            {errors.imageUrl && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.imageUrl.message}</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { reset(); onClose() }} className="btn-outline">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="btn-green">
            {isSubmitting ? 'Publicando...' : parentId ? 'Responder' : 'Publicar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
