'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { ReactNode } from 'react'

export function AppSidebarClient({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className='flex w-full flex-col'>
        <div className='flex items-center gap-1 border-b p-2'>
          <SidebarTrigger />
          <span className='text-xl'>WDS Jobs</span>
        </div>
        <div className='flex flex-1'>{children}</div>
      </div>
    )
  }

  return children
}
