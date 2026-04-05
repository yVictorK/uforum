'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const isStaticRoute = pathname === '/' || pathname.startsWith('/auth')

  useEffect(() => {
    setMounted(true)
    const html = document.documentElement

    if (isStaticRoute) {
      setTheme('dark')
      applyTheme('dark')
      return
    }

    // Lê o tema que já foi aplicado pelo script do layout.tsx
    const currentTheme = html.classList.contains('light') ? 'light' : 'dark'
    setTheme(currentTheme)
  }, [pathname, isStaticRoute])

  const applyTheme = (t: Theme) => {
    const html = document.documentElement
    if (t === 'light') {
      html.classList.add('light')
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
      html.classList.remove('light')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('uforum-theme', newTheme)
    if (!isStaticRoute) {
      applyTheme(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
