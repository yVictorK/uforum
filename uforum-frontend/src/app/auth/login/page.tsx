'use client'
import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type F = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (d: F) => {
    try {
      const { data } = await authApi.login(d)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success(`Bem-vindo(a), ${data.user.fullName}!`)
      router.push('/feed')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Email ou senha inválidos')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d' }}>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden border-r" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(0,196,79,0.06) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-sm">
          <Logo size={48} className="mb-8" />
          <h1 className="text-4xl font-black mb-4 leading-tight">A rede social da <span style={{ color: '#00c44f' }}>UFAM</span></h1>
          <p className="mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Comunidades, eventos, marketplace e mapa do campus — tudo para a vida universitária.
          </p>
          {['Fóruns por comunidade', 'Eventos do campus', 'Marketplace UFAM', 'Mapa interativo'].map((item) => (
            <div key={item} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,196,79,0.15)', border: '1px solid rgba(0,196,79,0.3)' }}>
                <span style={{ color: '#00c44f', fontSize: '10px' }}>✓</span>
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 lg:hidden">
            <Logo size={28} />
            <span className="font-bold">UForum</span>
          </Link>

          <h2 className="text-2xl font-black mb-1">Bem-vindo(a) de volta</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Entre com seu email institucional</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input {...register('email')} type="email" placeholder="seu@ufam.edu.br" className="input pl-10" />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Senha</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline text-emerald-500 mb-1.5 inline-block">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input px-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-green w-full justify-center py-3 text-base mt-2"
              style={{ boxShadow: '0 0 24px rgba(0,196,79,0.25)' }}>
              {isSubmitting ? 'Entrando...' : <><span>Entrar</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Não tem conta?{' '}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: '#00c44f' }}>Cadastre-se</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
