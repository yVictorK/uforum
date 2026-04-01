import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        // UForum Green — primary accent
        green: {
          50:  '#e6fff0',
          100: '#b3ffd1',
          200: '#80ffb2',
          300: '#4dff93',
          400: '#1aff74',
          500: '#00e855',
          600: '#00c44f',  // ← main brand green (from prototype)
          700: '#00a040',
          800: '#007c32',
          900: '#005824',
          950: '#003416',
        },
        // Dark surfaces
        dark: {
          50:  '#2a2a2a',
          100: '#222222',
          200: '#1e1e1e',
          300: '#1a1a1a',
          400: '#161616',
          500: '#121212',
          600: '#0e0e0e',
          700: '#0a0a0a',
          800: '#060606',
          900: '#030303',
          950: '#000000',
        },
        // Neutral grays for text/borders
        zinc: {
          750: '#2d2d2d',
          850: '#1f1f1f',
        },
      },
      boxShadow: {
        'glow-green': '0 0 24px rgba(0, 196, 79, 0.25)',
        'glow-green-sm': '0 0 12px rgba(0, 196, 79, 0.15)',
        'card': '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
        'inner-border': 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:{ from: { opacity: '0', transform: 'translateX(12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseGreen:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5', filter: 'brightness(1.3)' } },
        shimmer:     { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

export default config
