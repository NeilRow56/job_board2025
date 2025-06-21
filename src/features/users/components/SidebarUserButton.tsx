import { Suspense } from 'react'

import { auth } from '@clerk/nextjs/server'

import { SidebarUserButtonClient } from './_SidebarUserButtonClient'

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  )
}

async function SidebarUserSuspense() {
  const { userId } = await auth()

  if (userId == null) {
    return (
      // <SignOutButton>
      //   <SidebarMenuButton>
      //     <LogOutIcon />
      //     <span>Log Out</span>
      //   </SidebarMenuButton>
      // </SignOutButton>
      <div></div>
    )
  }

  return (
    <SidebarUserButtonClient
      user={{ email: 'kyle@test.com', name: 'Kyle Cook', imageUrl: '' }}
    />
  )
}
