'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { createPortal } from 'react-dom'

/* ── Modal ────────────────────────────────────────────────── */
interface ModalProps {
  open: boolean; onClose: () => void; title?: string
  children: React.ReactNode; size?: 'sm' | 'md' | 'lg'
}
const modalSizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) { document.addEventListener('keydown', h); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn('relative w-full card z-10 max-h-[90vh] overflow-y-auto', modalSizes[size])}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            {title && (
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <h2 className="font-bold text-base">{title}</h2>
                <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ── Skeleton ─────────────────────────────────────────────── */
export function Sk({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function PostSk() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex gap-3 items-center">
        <Sk className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1"><Sk className="h-3.5 w-28" /><Sk className="h-3 w-20" /></div>
      </div>
      <Sk className="h-4 w-3/4" /><Sk className="h-3 w-full" /><Sk className="h-3 w-4/5" />
      <div className="flex gap-3 pt-1">
        <Sk className="h-7 w-20 rounded-lg" /><Sk className="h-7 w-20 rounded-lg" /><Sk className="h-7 w-14 rounded-lg" />
      </div>
    </div>
  )
}

export function CommSk() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <Sk className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-1.5"><Sk className="h-4 w-28" /><Sk className="h-3 w-16" /></div>
        <Sk className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}

export function ProductSk() {
  return (
    <div className="card overflow-hidden">
      <Sk className="h-44 rounded-none" />
      <div className="p-4 space-y-2"><Sk className="h-4 w-3/4" /><Sk className="h-5 w-24" /></div>
    </div>
  )
}

/* ── EmptyState ───────────────────────────────────────────── */
interface EmptyProps { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }
export function Empty({ icon: Icon, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <Icon className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
