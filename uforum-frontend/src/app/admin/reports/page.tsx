'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, Flag, ShieldAlert } from 'lucide-react'
import { reportsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { AdminNav } from '@/components/admin/AdminNav'
import { ReportRow } from '@/components/admin/ReportRow'
import { Sk } from '@/components/ui/index'

export default function AdminReportsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) return
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      router.push('/feed')
    }
  }, [isAuthenticated, user, router])

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports', page],
    queryFn: () => reportsApi.getPending(page).then(r => r.data),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'MODERATOR')
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return <div className="page-wrap py-6"><Sk className="h-40 w-full" /></div>
  }

  const reports = reportsData?.content || []

  return (
    <div className="page-wrap py-6 max-w-5xl">
      <AdminNav />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Flag className="w-5 h-5 text-zinc-400" /> Fila de Moderação
          </h2>
          <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
            {reportsData?.totalElements || 0} pendentes
          </span>
        </div>

        <div>
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => <Sk key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <ShieldAlert className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-bold text-white mb-1">Nenhuma denúncia no momento!</h3>
              <p className="text-sm text-zinc-500">Tudo limpo por aqui. A comunidade está em paz.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {reports.map((r: any) => (
                <ReportRow key={r.id} report={r} />
              ))}
            </div>
          )}
        </div>

        {reportsData && reportsData.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/20">
             <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="btn-outline px-4 py-1.5 text-xs disabled:opacity-30">Anterior</button>
             <span className="text-xs font-medium text-zinc-500">Página {page + 1} de {reportsData.totalPages}</span>
             <button 
              disabled={page >= reportsData.totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="btn-outline px-4 py-1.5 text-xs disabled:opacity-30">Próxima</button>
          </div>
        )}
      </div>
    </div>
  )
}
