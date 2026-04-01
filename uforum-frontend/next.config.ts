import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ignora erros de TypeScript durante o build (os tipos existem só como documentação)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora warnings do ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}

export default nextConfig
