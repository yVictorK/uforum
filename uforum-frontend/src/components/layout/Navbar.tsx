'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bell, Search, LogOut, User, Menu, X, ShoppingBag, Map, CalendarDays, Users, Home, BookmarkIcon, Plus, Hash, Shield, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/communities', label: 'Comunidades', icon: Hash },
  { href: '/events', label: 'Eventos', icon: CalendarDays },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/map', label: 'Mapa', icon: Map },
]

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  const { data: unread = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => usersApi.getUnreadCount().then((r) => Number(r.data)),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) { router.push(`/feed?q=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  const handleLogout = () => { logout(); router.push('/auth/login') }

  return (
    <>
      <header className={cn('fixed top-0 left-0 right-0 z-40 h-14 transition-all duration-200', scrolled ? 'glass' : 'glass')}>
        <div className="page-wrap h-full flex items-center gap-4">
          <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 flex-shrink-0 mr-1">
            <Logo size={28} />
            <span className="font-bold text-base hidden sm:block tracking-tight">UForum</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar posts, comunidades..."
                className="input pl-9 py-2 text-sm h-9" />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    active ? 'text-emerald-500' : 'hover:bg-[var(--bg-secondary)]'
                  )}
                  style={{ color: active ? 'var(--emerald-500)' : 'var(--text-secondary)' }}>
                  <Icon className="w-4 h-4" />{label}
                  {active && <span className="sr-only">(ativo)</span>}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 ml-auto">
            {isAuthenticated && (
              <Link href="/feed?create=1"
                className="btn-green hidden sm:inline-flex text-xs py-1.5 px-3 rounded-lg">
                <Plus className="w-3.5 h-3.5" />Criar
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link href="/notifications" className="btn-ghost p-2 rounded-lg relative">
                  <Bell className="w-4 h-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                      style={{ background: 'var(--emerald-500)', color: '#fff' }}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
                <Link href="/saved" className="btn-ghost p-2 rounded-lg hidden sm:flex">
                  <BookmarkIcon className="w-4 h-4" />
                </Link>

                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                    <Avatar src={user?.profilePictureUrl} name={user?.fullName ?? 'U'} size="sm" />
                    <span className="text-sm font-medium hidden md:block max-w-[80px] truncate"
                      style={{ color: 'var(--text-secondary)' }}>{user?.username}</span>
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.96 }}
                          className="absolute right-0 top-full mt-2 w-48 rounded-xl z-20 overflow-hidden py-1 border shadow-xl"
                          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{user?.username}</p>
                          </div>
                          <div className="p-1">
                            <Link href={`/profile/${user?.username}`} onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                              style={{ color: 'var(--text-secondary)' }}>
                              <User className="w-4 h-4" />Meu Perfil
                            </Link>

                            <button onClick={() => { toggleTheme(); setUserMenu(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                              style={{ color: 'var(--text-secondary)' }}>
                              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                              {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                            </button>

                            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                              <Link href="/admin/users" onClick={() => setUserMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--emerald-500)]/10"
                                style={{ color: 'var(--emerald-500)' }}>
                                <Shield className="w-4 h-4" />Acessar Painel
                              </Link>
                            )}

                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[rgba(255,69,69,0.1)]"
                              style={{ color: '#ff6b6b' }}>
                              <LogOut className="w-4 h-4" />Sair
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm py-1.5">Entrar</Link>
                <Link href="/auth/register" className="btn-green text-sm py-1.5 px-4">Cadastrar</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost p-2 lg:hidden">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-14 left-0 right-0 z-30 p-4 space-y-1 lg:hidden glass border-b"
            style={{ borderColor: 'var(--border-primary)' }}>
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar..." className="input pl-10 py-2.5 text-sm" />
              </div>
            </form>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === href ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-[var(--bg-secondary)]'
                )} style={{ color: pathname === href ? 'var(--emerald-500)' : 'var(--text-secondary)' }}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/saved" onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === '/saved' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-[var(--bg-secondary)]'
                )} style={{ color: pathname === '/saved' ? 'var(--emerald-500)' : 'var(--text-secondary)' }}>
                <BookmarkIcon className="w-4 h-4" />Salvos
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/feed?create=1" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--emerald-500)', color: '#fff' }}>
                <Plus className="w-4 h-4" />Criar Post
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
