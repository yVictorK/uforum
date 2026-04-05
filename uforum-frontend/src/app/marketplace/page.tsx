'use client'
import { useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, ShoppingBag, SlidersHorizontal, AlertCircleIcon } from 'lucide-react'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Modal } from '@/components/ui/index'
import { ProductSk, Empty } from '@/components/ui/index'
import { marketplaceApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Product, Page } from '@/types'
import toast from 'react-hot-toast'

const CATS = ['Eletrônicos', 'Livros', 'Alimentos', 'Roupas', 'Móveis', 'Serviços', 'Outros']
const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  price: z.coerce.number().min(0.01),
  category: z.string().optional(),
  imageUrls: z.string().optional(),
})
type F = z.infer<typeof schema>

export default function MarketplacePage() {
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['marketplace', q, cat],
    queryFn: ({ pageParam = 0 }) => marketplaceApi.list(pageParam as number, q || undefined, cat || undefined).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (last: Page<Product>) => last.last ? undefined : last.number + 1,
  })
  const products = data?.pages.flatMap((p) => p.content) ?? []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })
  const onCreate = async (d: F) => {
    try {
      const imgs = d.imageUrls ? d.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean) : []
      await marketplaceApi.create({ ...d, imageUrls: imgs })
      toast.success('Anúncio criado!'); reset(); setCreateOpen(false); await qc.invalidateQueries({ queryKey: ['marketplace'] }); refetch()
    } catch (err: unknown) { toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro') }
  }

  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { isSubmitting: editSubmitting } } = useForm<F>()

  const openEdit = (product: Product) => {
    resetEdit({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category ?? '',
      imageUrls: product.imageUrls.join('\n'),
    })
    setEditProduct(product)
  }

  const onEditSubmit = async (d: F) => {
    if (!editProduct) return
    try {
      const imgs = d.imageUrls ? d.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean) : []
      await marketplaceApi.update(editProduct.id, { ...d, imageUrls: imgs })
      toast.success('Anúncio atualizado!')
      setEditProduct(null)
      resetEdit()
      await qc.invalidateQueries({ queryKey: ['marketplace'] })
    } catch (err: unknown) { toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao atualizar') }
  }

  return (
    <div className="page-wrap pt-5 pb-6 sm:py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Marketplace</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Compre e venda entre estudantes</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreateOpen(true)} className="btn-green text-sm"><Plus className="w-4 h-4" />Anunciar</button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produtos..." className="input pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="input w-auto">
            <option value="">Todas as categorias</option>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <ProductSk key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Empty icon={ShoppingBag} title="Nenhum produto" description={q ? 'Tente outros termos' : 'Seja o primeiro a anunciar!'} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} onDelete={refetch} onEdit={openEdit} />)}
          </div>
          {hasNextPage && <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-outline w-full justify-center py-3 mt-4">{isFetchingNextPage ? 'Carregando...' : 'Mais'}</button>}
        </>
      )}

      <Modal open={createOpen} onClose={() => { reset(); setCreateOpen(false) }} title="Criar Anúncio" size="lg">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Título</label><input {...register('title')} placeholder="O que você vende?" className="input" /></div>
            <div><label className="label">Preço (R$)</label><input {...register('price')} type="number" step="0.01" placeholder="0,00" className="input" /></div>
            <div><label className="label">Categoria</label><select {...register('category')} className="input"><option value="">Selecionar...</option>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Descrição</label><textarea {...register('description')} rows={3} className="input resize-none" /></div>
            <div className="sm:col-span-2"><label className="label">URLs das imagens (uma por linha)</label><textarea {...register('imageUrls')} rows={3} placeholder="https://..." className="input resize-none font-mono text-xs" /></div>
          </div>
          <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <AlertCircleIcon className="w-4 h-4" /> Adicione um WhatsApp no seu perfil para que compradores entrem em contato.
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { reset(); setCreateOpen(false) }} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-green">{isSubmitting ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editProduct} onClose={() => { resetEdit(); setEditProduct(null) }} title="Editar Anúncio" size="lg">
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Título</label><input {...regEdit('title')} className="input" /></div>
            <div><label className="label">Preço (R$)</label><input {...regEdit('price')} type="number" step="0.01" className="input" /></div>
            <div><label className="label">Categoria</label><select {...regEdit('category')} className="input"><option value="">Selecionar...</option>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Descrição</label><textarea {...regEdit('description')} rows={3} className="input resize-none" /></div>
            <div className="sm:col-span-2"><label className="label">URLs das imagens (uma por linha)</label><textarea {...regEdit('imageUrls')} rows={3} className="input resize-none font-mono text-xs" /></div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { resetEdit(); setEditProduct(null) }} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={editSubmitting} className="btn-green">{editSubmitting ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      </Modal>
    </div >
  )
}
