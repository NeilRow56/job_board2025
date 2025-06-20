import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

import { ReactNode } from 'react'
import { AppSidebarClient } from './_AppSidebarClient'

export function AppSidebar({
  children,
  content,
  footerButton
}: {
  children: ReactNode
  content: ReactNode
  footerButton: ReactNode
}) {
  return (
    <SidebarProvider className='overflow-y-hidden'>
      <AppSidebarClient>
        <Sidebar collapsible='icon' className='overflow-hidden'>
          <SidebarHeader className='flex-row'>
            <SidebarTrigger />
            <span className='text-xl text-nowrap'>WDS Jobs</span>
          </SidebarHeader>
          <SidebarContent>{content}</SidebarContent>
          <div className='mb-16'>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </div>
        </Sidebar>
        <main className='flex-1'>{children}</main>
      </AppSidebarClient>
    </SidebarProvider>
  )
}
