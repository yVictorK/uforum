import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  size?: number
  className?: string
}

export function Logo({ size = 28, className }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt="UForum"
      width={size}
      height={size * (70 / 62)}
      className={cn('flex-shrink-0', className)}
      priority
    />
  )
}
