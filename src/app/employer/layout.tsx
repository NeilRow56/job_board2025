import { AppSidebar } from '@/components/sidebar/AppSidebar'
import { SidebarNavMenuGroup } from '@/components/sidebar/SidebarNavMenuGroup'

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { SidebarOrganizationButton } from '@/features/organizations/components/SidebarOrganizationButton'

import { ClipboardListIcon, PlusIcon } from 'lucide-react'

import Link from 'next/link'

import { ReactNode, Suspense } from 'react'

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>

            <SidebarGroupAction title='Add Job Listing' asChild>
              <Link href='/employer/job-listings/new'>
                <PlusIcon /> <span className='sr-only'>Add Job Listing</span>
              </Link>
            </SidebarGroupAction>

            <SidebarGroupContent className='group-data-[state=collapsed]:hidden'>
              <Suspense>
                <JobListingMenu />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className='mt-auto'
            items={[
              { href: '/', icon: <ClipboardListIcon />, label: 'Job Board' }
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  )
}

async function JobListingMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href='/employer/job-listings/new'>
            <PlusIcon />
            <span>Create your first job listing</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
