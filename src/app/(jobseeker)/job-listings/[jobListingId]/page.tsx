import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Suspense } from 'react'
import { JobListingItems } from '../../_shared/JobListingItems'

import { notFound } from 'next/navigation'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings'
import { JobListingTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { getOrganizationIdTag } from '@/features/organizations/db/cache/organizations'
import { db } from '@/db'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRender'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { convertSearchParamsToString } from '@/lib/convertSearchParamsToString'
import { XIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IsBreakpoint } from '@/components/IsBreakpoint'
import { ClientSheet } from './_ClientSheet'

export default function JobListingPage({
  params,
  searchParams
}: {
  params: Promise<{ jobListingId: string }>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  return (
    <>
      <ResizablePanelGroup autoSaveId='job-board-panel' direction='horizontal'>
        <ResizablePanel id='left' order={1} defaultSize={60} minSize={30}>
          <div className='h-screen overflow-y-auto p-4'>
            <JobListingItems searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>
        <IsBreakpoint
          breakpoint='min-width: 1024px'
          otherwise={
            <ClientSheet>
              <SheetContent hideCloseButton className='overflow-y-auto p-4'>
                <SheetHeader className='sr-only'>
                  <SheetTitle>Job Listing Details</SheetTitle>
                </SheetHeader>
                <Suspense fallback={<LoadingSpinner />}>
                  <JobListingDetails
                    searchParams={searchParams}
                    params={params}
                  />
                </Suspense>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className='mx-2' />
          <ResizablePanel id='right' order={2} defaultSize={40} minSize={30}>
            <div className='h-screen overflow-y-auto p-4'>
              <Suspense fallback={<LoadingSpinner />}>
                <JobListingDetails
                  params={params}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </ResizablePanel>
        </IsBreakpoint>
      </ResizablePanelGroup>
    </>
  )
}

async function JobListingDetails({
  params,
  searchParams
}: {
  params: Promise<{ jobListingId: string }>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const { jobListingId } = await params
  const jobListing = await getJobListing(jobListingId)
  if (jobListing == null) return notFound()

  const nameInitials = jobListing.organization.name
    .split(' ')
    .splice(0, 4)
    .map(word => word[0])
    .join('')

  return (
    <div className='@container space-y-6'>
      <div className='space-y-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='size-14 @max-md:hidden'>
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className='bg-primary text-primary-foreground uppercase'>
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              {jobListing.title}
            </h1>
            <div className='text-muted-foreground text-base'>
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className='text-muted-foreground text-sm @min-lg:hidden'>
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className='ml-auto flex items-center gap-4'>
            {jobListing.postedAt != null && (
              <div className='text-muted-foreground text-sm @max-lg:hidden'>
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size='icon' variant='outline' asChild>
              <Link
                href={`/?${convertSearchParamsToString(await searchParams)}`}
              >
                <span className='sr-only'>Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className='mt-2 flex flex-wrap gap-2'>
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          Apply Button
        </Suspense>
      </div>

      <MarkdownRenderer source={jobListing.description} />
    </div>
  )
}

async function getJobListing(id: string) {
  'use cache'
  cacheTag(getJobListingIdTag(id))

  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, 'published')
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true
        }
      }
    }
  })

  if (listing != null) {
    cacheTag(getOrganizationIdTag(listing.organization.id))
  }

  return listing
}
