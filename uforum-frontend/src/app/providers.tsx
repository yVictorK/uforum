'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,        // 30s — data refetches more readily
        gcTime: 5 * 60_000,       // 5min garbage collection
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#f0f0f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00c44f', secondary: '#000' } },
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  )
}
