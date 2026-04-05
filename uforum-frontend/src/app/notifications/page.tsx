'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, ArrowUp, MessageSquare, UserPlus, CalendarDays } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { Empty, Sk } from '@/components/ui/index'
import { timeAgo, cn } from '@/lib/utils'
import type { Notification } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

const typeIcon: Record<string, { icon: React.ElementType; color: string }> = {
  POST_REPLY:  { icon: MessageSquare, color: 'var(--emerald-500)' },
  POST_UPVOTE: { icon: ArrowUp,       color: 'var(--emerald-500)' },
  NEW_FOLLOWER:{ icon: UserPlus,      color: '#a78bfa' }, // Keeping soft purple for followers
  EVENT_REMINDER: { icon: CalendarDays, color: '#f59e0b' },
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => usersApi.getNotifications(0).then((r) => r.data),
    enabled: !!user,
  })

  const markAll = useMutation({
    mutationFn: () => usersApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Tudo marcado como lido') },
  })

  const notifs: Notification[] = data?.content ?? []
  const hasUnread = notifs.some((n) => !n.isRead)

  if (!user) return (
    <div className="page-wrap py-16 text-center">
      <Bell className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
      <p className="mb-4 text-[var(--text-muted)]">Faça login para ver suas notificações</p>
      <Link href="/auth/login" className="btn-green inline-flex">Entrar</Link>
    </div>
  )

  return (
    <div className="page-wrap pt-5 pb-6 sm:py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Notificações</h1>
          {hasUnread && <p className="text-sm mt-0.5" style={{ color: 'var(--emerald-500)' }}>{notifs.filter((n) => !n.isRead).length} não lidas</p>}
        </div>
        {hasUnread && (
          <button onClick={() => markAll.mutate()} disabled={markAll.isPending} className="btn-ghost text-sm flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" />Marcar tudo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <Sk className="w-10 h-10 rounded-full" /><div className="flex-1 space-y-1.5"><Sk className="h-3.5 w-3/4" /><Sk className="h-3 w-20" /></div>
          </div>
        ))}</div>
      ) : notifs.length === 0 ? (
        <Empty icon={Bell} title="Nenhuma notificação" description="Quando alguém interagir com você, aparece aqui." />
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const meta = typeIcon[n.type] ?? { icon: Bell, color: 'rgba(255,255,255,0.3)' }
            const Icon = meta.icon
            return (
              <div key={n.id} className={cn('card p-4 flex items-start gap-3 transition-all', !n.isRead && 'border-[var(--emerald-500)]/20 bg-[var(--emerald-500)]/5')}>
                {n.actor ? (
                  <Avatar src={n.actor.profilePictureUrl} name={n.actor.fullName} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--emerald-500)' }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
