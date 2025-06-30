import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import { ComponentProps } from 'react'

export function LoadingSpinner({
  className,
  ...props
}: ComponentProps<typeof Loader2Icon>) {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Loader2Icon
        className={cn('size-16 animate-spin', className)}
        {...props}
      />
    </div>
  )
}
