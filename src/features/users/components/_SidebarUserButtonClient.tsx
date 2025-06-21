'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { SignOutButton } from '@/services/clerk/components/AuthButtons'
import { useClerk } from '@clerk/nextjs'
import {
  ChevronsUpDown,
  LogOutIcon,
  SettingsIcon,
  UserIcon
} from 'lucide-react'
import Link from 'next/link'

type User = {
  name: string
  imageUrl: string
  email: string
}

export function SidebarUserButtonClient({ user }: { user: User }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { openUserProfile } = useClerk()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <UserInfo {...user} />
          <ChevronsUpDown className='ml-auto group-data-[state=collapsed]:hidden' />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={4}
        align='end'
        side={isMobile ? 'bottom' : 'right'}
        className='max-w-80 min-w-64'
      >
        <DropdownMenuLabel className='p-1 font-normal'>
          <UserInfo {...user} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            openUserProfile()
            setOpenMobile(false)
          }}
        >
          <UserIcon className='mr-1' /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/user-settings/notifications'>
            <SettingsIcon className='mr-1' /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem>
            <LogOutIcon className='mr-1' /> Log Out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserInfo({ imageUrl, email, name }: User) {
  const nameInitials = name
    .split(' ')
    .slice(0, 2)
    .map(str => str[0])
    .join('')

  return (
    <div className='flex items-center gap-2 overflow-hidden'>
      <Avatar className='size-8 rounded-lg'>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className='bg-primary text-primary-foreground uppercase'>
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className='flex min-w-0 flex-1 flex-col leading-tight group-data-[state=collapsed]:hidden'>
        <span className='truncate text-sm font-semibold'>{name}</span>
        <span className='truncate text-xs'>{email}</span>
      </div>
    </div>
  )
}
