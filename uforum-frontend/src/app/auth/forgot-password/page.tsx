'use client'
import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const schema = z.object({
  email: z.string().email('Email inválido').regex(/.*@([a-z0-9]+\.)*ufam\.edu\.br$/, 'Somente e-mails da UFAM'),
})
type F = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: F) => {
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
      toast.success('Link enviado para seu e-mail!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao processar solicitação')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black mb-2">E-mail Enviado!</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Verifique a caixa de entrada do seu e-mail institucional. Enviamos um link para você redefinir sua senha.
          </p>
          <Link href="/auth/login" className="btn-outline w-full justify-center">
            Voltar para o Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm mb-8 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        
        <Logo size={40} className="mb-6" />
        <h1 className="text-2xl font-black mb-1">Recuperar Senha</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Informe seu e-mail institucional da UFAM para receber o link de redefinição.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input {...register('email')} type="email" placeholder="nome@ufam.edu.br" className="input pl-10" />
            </div>
            {errors.email && <p className="text-xs mt-1 text-rose-500">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-green w-full justify-center py-3 mt-2">
            {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
