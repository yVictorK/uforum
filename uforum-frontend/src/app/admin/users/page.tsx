'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, CalendarDays, Key, MoreVertical, Search, FileText, Ban, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useAuthStore } from '@/store/auth'
import { adminApi } from '@/lib/api'
import { Avatar } from '@/components/ui/Avatar'
import { Sk } from '@/components/ui/index'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) return
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      toast.error('Acesso negado. Apenas Moderadores e Administradores.')
      router.push('/feed')
    }
  }, [isAuthenticated, user, router])

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.getMetrics().then((r) => r.data),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'MODERATOR'),
  })

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.getUsers(page).then((r) => r.data),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'MODERATOR'),
  })

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => adminApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('Cargo atualizado com sucesso!')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar cargo.')
    }
  })

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id: string) => adminApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('Status do usuário atualizado!')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar status.')
    }
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return <div className="page-wrap py-6"><Sk className="h-40 w-full" /></div>
  }

  const usersList = usersData?.content || []
  const filteredUsers = search ? usersList.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase())
  ) : usersList;

  const roleColors: Record<string, string> = {
    'ADMIN': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    'MODERATOR': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'EVENT_MANAGER': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'STUDENT': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'PROFESSOR': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }

  return (
    <div className="page-wrap py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Shield className="w-8 h-8 text-emerald-500" />
          Painel de Administração
        </h1>
        <p className="text-sm mt-1 text-zinc-400">Gerenciamento de usuários e moderação avançada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total de Usuários', value: metrics?.totalUsers, load: loadingMetrics, color: 'text-emerald-500' },
          { icon: FileText, label: 'Publicações (Posts)', value: metrics?.totalPosts, load: loadingMetrics, color: 'text-blue-500' },
          { icon: CalendarDays, label: 'Eventos Criados', value: metrics?.totalEvents, load: loadingMetrics, color: 'text-rose-500' },
        ].map((m, i) => (
          <div key={i} className="card p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.02] rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-white/5`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">{m.label}</p>
            {m.load ? <Sk className="h-8 w-16 mt-1" /> : (
              <h2 className="text-3xl font-bold mt-1 tracking-tight">{m.value}</h2>
            )}
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" /> Usuários Registrados
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuário..."
              className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loadingUsers ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Sk key={i} className="w-full h-16 rounded-xl" />)}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Usuário</th>
                  <th className="px-6 py-4 font-medium">Cargo</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Data de Registro</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} size="sm" src={undefined} />
                        <div>
                          <p className="font-semibold text-white truncate max-w-[150px]">{u.fullName}</p>
                          <p className="text-zinc-500 text-xs truncate max-w-[150px]">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Banido
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {format(new Date(u.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole({ id: u.id, role: e.target.value })}
                          disabled={user.role === 'MODERATOR' && (u.role === 'ADMIN' || u.role === 'MODERATOR')}
                          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="EVENT_MANAGER">Event Manager</option>
                          <option value="PROFESSOR">Professor</option>
                          {user.role === 'ADMIN' && <option value="MODERATOR">Moderator</option>}
                          {user.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                        </select>

                        <button
                          onClick={() => { if (window.confirm(`Deseja ${u.isActive ? 'banir' : 'desbanir'} este usuário?`)) toggleStatus(u.id) }}
                          disabled={u.role === 'ADMIN' && user.role === 'MODERATOR'}
                          title={u.isActive ? 'Banir Usuário' : 'Desbanir Usuário'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${u.isActive ? 'hover:bg-rose-500/20 text-rose-500' : 'hover:bg-emerald-500/20 text-emerald-500'}`}
                        >
                          {u.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loadingUsers && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
          <p className="text-xs text-zinc-500">Mostrando até 20 registros por página.</p>
        </div>
      </div>
    </div>
  )
}
