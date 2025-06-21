import { Suspense } from 'react'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { LogOutIcon } from 'lucide-react'

import { SignOutButton } from '@/services/clerk/components/AuthButtons'
import { SidebarUserButtonClient } from './_SidebarUserButtonClient'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  )
}

async function SidebarUserSuspense() {
  // const { userId } = await auth()
  const { user } = await getCurrentUser({ allData: true })

  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    )
  }

  return <SidebarUserButtonClient user={user} />
}
