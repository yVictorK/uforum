'use client'
import { useState, Suspense } from 'react'
import { Logo } from '@/components/ui/Logo'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Link from 'next/link'

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%*])[a-zA-Z0-9!@#$%*]{8,}$/, 'Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 especial (!@#$%*)'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword']
})
type F = z.infer<typeof schema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: '#0d0d0d' }}>
        <div className="max-w-sm">
          <h2 className="text-xl font-bold mb-4">Token inválido</h2>
          <p className="text-zinc-500 mb-6 text-sm">O link de recuperação está incompleto ou expirou.</p>
          <Link href="/auth/forgot-password" className="btn-green w-full block">Solicitar novo link</Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: F) => {
    try {
      await authApi.resetPassword({ token, newPassword: data.password })
      setSuccess(true)
      toast.success('Senha atualizada com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao redefinir senha')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black mb-2">Sucesso!</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sua senha foi atualizada com sucesso. Agora você já pode entrar na sua conta.
          </p>
          <Link href="/auth/login" className="btn-green w-full justify-center">
            Entrar no UForum
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Logo size={40} className="mb-6" />
        <h1 className="text-2xl font-black mb-1">Nova Senha</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Digite sua nova senha de acesso abaixo.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Mín. 8 caracteres" className="input px-10" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1 text-rose-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" className="input px-10" />
            </div>
            {errors.confirmPassword && <p className="text-xs mt-1 text-rose-500">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-green w-full justify-center py-3 mt-4">
            {isSubmitting ? 'Atualizando...' : <><span>Redefinir Senha</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
