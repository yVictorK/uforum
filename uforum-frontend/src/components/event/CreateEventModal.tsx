'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/index'
import { eventsApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { CalendarDays, Link2, MapPin } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Dê um título ao evento').max(200),
  description: z.string().min(1, 'Adicione uma descrição do evento'),
  imageUrl: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  location: z.string().min(1, 'Informe o local onde ocorrerá'),
  startDate: z.string().min(1, 'Data e hora de início são obrigatórias'),
  endDate: z.string().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any; // If provided, modal is in EDIT mode
}

export function CreateEventModal({ open, onClose, onSuccess, initialData }: Props) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      location: initialData.location,
      startDate: initialData.startDate?.split('.')[0].slice(0, 16), // normalize format for datetime-local
      endDate: initialData.endDate ? initialData.endDate.split('.')[0].slice(0, 16) : undefined,
      imageUrl: initialData.imageUrl || '',
    } : {}
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EVENT_MANAGER')) {
    return null
  }

  const onSubmit = async (data: FormData) => {
    try {
      // Ajusta o formato da data para o LocalDateTime do Spring Boot (yyyy-MM-dd'T'HH:mm)
      // O input datetime-local já vem no formato 'YYYY-MM-DDTHH:mm'
      const payload = {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate, // 'YYYY-MM-DDTHH:mm'
        endDate: data.endDate || undefined,
        imageUrl: data.imageUrl || undefined,
      }

      if (initialData) {
        await eventsApi.update(initialData.id, payload)
        toast.success('Evento atualizado com sucesso!')
      } else {
        await eventsApi.create(payload)
        toast.success('Evento criado com sucesso!')
      }
      await qc.invalidateQueries({ queryKey: ['events'] })
      reset()
      onClose()
      onSuccess?.()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? (initialData ? 'Erro ao atualizar evento.' : 'Erro ao criar evento.'))
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title={initialData ? "Editar Evento" : "Cadastrar Evento"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Título do Evento</label>
          <input {...register('title')} placeholder="Ex: Simpósio de Tecnologia" className="input" />
          {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea {...register('description')} rows={4} placeholder="Sobre o que é o evento..." className="input resize-none" />
          {errors.description && <p className="text-xs mt-1 text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Localização</label>
          <input {...register('location')} placeholder="Ex: Auditório Samaúma" className="input" />
          {errors.location && <p className="text-xs mt-1 text-red-500">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Data e Hora de Início</label>
            <input type="datetime-local" {...register('startDate')} className="input" />
            {errors.startDate && <p className="text-xs mt-1 text-red-500">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Fim (Opcional)</label>
            <input type="datetime-local" {...register('endDate')} className="input" />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />URL do Banner/Imagem (Opcional)</label>
          <input {...register('imageUrl')} placeholder="https://..." className="input" />
          {errors.imageUrl && <p className="text-xs mt-1 text-red-500">{errors.imageUrl.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => { reset(); onClose() }} className="btn-outline">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="btn-green">
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Configurações' : 'Cadastrar Evento')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
