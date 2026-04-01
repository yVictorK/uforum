import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

// FIX: backend returns LocalDateTime without timezone (e.g. "2026-03-19T10:00:00")
// JavaScript treats this as LOCAL time, but it's actually UTC from the server.
// Appending 'Z' forces correct UTC parsing.
const parseDate = (d: string): Date => {
  if (!d) return new Date()
  // If already has timezone info, use as-is
  if (d.endsWith('Z') || d.includes('+') || d.includes('-', 10)) return new Date(d)
  // Otherwise treat as UTC
  return new Date(d + 'Z')
}

export const timeAgo = (d: string) =>
  formatDistanceToNow(parseDate(d), { addSuffix: true, locale: ptBR })

export const fmtDate = (d: string) =>
  format(parseDate(d), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })

export const fmtPrice = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

export const fmtNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

export const roleLabel = (r: string) =>
  ({ STUDENT: 'Estudante', PROFESSOR: 'Professor', MODERATOR: 'Moderador', EVENT_MANAGER: 'Gestor de Eventos', ADMIN: 'Admin' }[r] ?? r)

export const whatsappUrl = (num: string, msg = '') => {
  const clean = num.replace(/\D/g, '')
  return `https://wa.me/${clean}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
}

export const statusLabel = (s: string) =>
  ({ AVAILABLE: 'Disponível', RESERVED: 'Reservado', SOLD: 'Vendido' }[s] ?? s)
