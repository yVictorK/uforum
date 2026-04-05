'use client'
import { Modal } from './index'
import { AlertCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: Props) {
  return (
    <Modal open={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={variant === 'danger' ? 'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-red-500/10 text-red-500 border border-red-500/20' : 'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}>
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm px-2 mb-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button onClick={onClose} className="btn-outline flex-1 order-2 sm:order-1">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'btn-red flex-1 order-1 sm:order-2' : 'btn-green flex-1 order-1 sm:order-2'}>
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
