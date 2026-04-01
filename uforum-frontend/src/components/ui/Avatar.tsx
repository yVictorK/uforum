import { cn, initials } from '@/lib/utils'
import Image from 'next/image'

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }
const cls = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

interface Props {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
  ring?: boolean
}

export function Avatar({ src, name, size = 'md', className, ring }: Props) {
  return (
    <div className={cn(
      'relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold select-none',
      cls[size],
      ring && 'ring-2 ring-[#00c44f]/40 ring-offset-2 ring-offset-[#0d0d0d]',
      className
    )}
    style={{ background: 'linear-gradient(135deg, #00c44f22 0%, #00c44f44 100%)', border: '1px solid rgba(0,196,79,0.2)' }}>
      {src ? (
        <Image src={src} alt={name} width={sizes[size]} height={sizes[size]} className="object-cover w-full h-full" unoptimized />
      ) : (
        <span style={{ color: '#00c44f' }}>{initials(name)}</span>
      )}
    </div>
  )
}
