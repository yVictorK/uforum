'use client'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Hash, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useState } from 'react'

const COURSES = [
  'Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação',
  'Engenharia Elétrica', 'Engenharia Civil', 'Medicina', 'Direito',
  'Administração', 'Psicologia', 'Outro',
]

const schema = z.object({
  fullName:        z.string().min(3, 'Mínimo 3 caracteres').max(100),
  username:        z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  email:           z.string().email('Email inválido').regex(/.*@([a-z0-9]+\.)*ufam\.edu\.br$/, 'Somente e-mails da UFAM'),
  studentId:       z.string().min(6, 'Mínimo 6 caracteres').max(20),
  password:        z.string().min(8, 'Mínimo 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%*])[a-zA-Z0-9!@#$%*]{8,}$/, 'Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 especial (!@#$%*)'),
  confirmPassword: z.string(),
  course:          z.string().optional(),
  semester:        z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

type F = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (d: F) => {
    try {
      const { confirmPassword: _, semester, course, ...rest } = d

      // Monta payload sem campos vazios, convertendo semester para numero
      const payload: Record<string, unknown> = { ...rest }
      if (course && course.trim() !== '') payload.course = course
      if (semester && semester.trim() !== '') {
        const n = parseInt(semester, 10)
        if (!isNaN(n)) payload.semester = n
      }

      const { data } = await authApi.register(payload)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Conta criada! 🎉')
      router.push('/feed')
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string; errors?: Record<string, string> } } })?.response?.data
      if (resp?.errors) {
        toast.error(Object.values(resp.errors)[0] ?? 'Erro de validação')
      } else {
        toast.error(resp?.message ?? 'Erro ao criar conta')
      }
    }
  }

  const ErrMsg = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{msg}</p> : null

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d0d' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Logo size={32} />
          <span className="font-bold text-lg">UForum</span>
        </Link>

        <div className="card p-8" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h1 className="text-2xl font-black mb-1">Criar sua conta</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Exclusivo para a comunidade UFAM</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className="label">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input {...register('fullName')} placeholder="Seu nome completo" className="input pl-10" />
                </div>
                <ErrMsg msg={errors.fullName?.message} />
              </div>

              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>@</span>
                  <input {...register('username')} placeholder="seu_username" className="input pl-8" />
                </div>
                <ErrMsg msg={errors.username?.message} />
              </div>

              <div>
                <label className="label">Matrícula</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input {...register('studentId')} placeholder="21250001" className="input pl-10" />
                </div>
                <ErrMsg msg={errors.studentId?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Email institucional</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input {...register('email')} type="email" placeholder="seu@ufam.edu.br" className="input pl-10" />
                </div>
                <ErrMsg msg={errors.email?.message} />
              </div>

              <div>
                <label className="label">Curso <span style={{ color: 'rgba(255,255,255,0.25)' }}>(opcional)</span></label>
                <select {...register('course')} className="input">
                  <option value="">Selecionar...</option>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Período <span style={{ color: 'rgba(255,255,255,0.25)' }}>(opcional)</span></label>
                <input {...register('semester')} type="number" min={1} max={12} placeholder="1 – 12" className="input" />
                <ErrMsg msg={errors.semester?.message} />
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Mín. 8 caracteres" className="input px-10" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <ErrMsg msg={errors.password?.message} />
              </div>

              <div>
                <label className="label">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" className="input px-10" />
                </div>
                <ErrMsg msg={errors.confirmPassword?.message} />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-green w-full justify-center py-3 text-base mt-2"
              style={{ boxShadow: '0 0 24px rgba(0,196,79,0.2)' }}>
              {isSubmitting ? 'Criando conta...' : <><span>Criar conta</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Já tem conta?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#00c44f' }}>Fazer login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
