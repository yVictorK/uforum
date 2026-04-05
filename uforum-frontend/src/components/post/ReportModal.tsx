'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/index'
import { AlertCircle, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

const REASONS = [
  { id: 'SPAM', label: 'Spam / Divulgação Indesejada' },
  { id: 'HARASSMENT', label: 'Assédio ou Bullying' },
  { id: 'HATE_SPEECH', label: 'Discurso de Ódio ou Preconceito' },
  { id: 'INAPPROPRIATE', label: 'Conteúdo Sexual ou Impróprio' },
  { id: 'MISINFORMATION', label: 'Desinformação / Fake News' },
  { id: 'OTHER', label: 'Outro motivo' },
]

export function ReportModal({ isOpen, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReport = async () => {
    if (!selected) return toast.error('Selecione um motivo')
    setLoading(true)
    try {
      await onConfirm(selected)
      onClose()
      setSelected('')
    } catch {
      toast.error('Erro ao enviar denúncia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Denunciar Post" size="md">
      <div className="space-y-4">
        <div className="p-3 rounded-xl text-xs flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="leading-relaxed">Se você acha que este post viola as diretrizes da comunidade, selecione o motivo abaixo. Nossa moderação analisará a denúncia em breve.</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className="flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group"
              style={{
                background: selected === r.id ? 'var(--emerald-500)/10' : 'var(--bg-secondary)',
                borderColor: selected === r.id ? 'var(--emerald-500)' : 'var(--border-primary)',
              }}>
              <span className="text-sm font-medium" style={{ color: selected === r.id ? 'var(--emerald-500)' : 'var(--text-primary)' }}>
                {r.label}
              </span>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: selected === r.id ? 'var(--emerald-500)' : 'var(--border-primary)' }}>
                {selected === r.id && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--emerald-500)' }} />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-outline">Cancelar</button>
          <button onClick={handleReport} disabled={loading} className="btn-green">
            {loading ? 'Enviando...' : 'Enviar Denúncia'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
