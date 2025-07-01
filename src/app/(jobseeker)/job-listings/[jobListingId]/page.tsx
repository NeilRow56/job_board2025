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
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable
} from '@/db/schema'
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
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { SignUpButton } from '@/services/clerk/components/AuthButtons'
import { getJobListingApplicationIdTag } from '@/features/jobListingApplications/db/cache/jobListingApplications'
import { differenceInDays } from 'date-fns'
import { connection } from 'next/server'
import { getUserResumeIdTag } from '@/features/users/db/cache/userResume'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { NewJobListingApplicationForm } from '@/features/jobListingApplications/components/NewJobListingApplicationForm'

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
                {jobListing.postedAt.toLocaleDateString('en-GB', {
                  timeZone: 'UTC'
                })}
              </div>
            )}
          </div>
          <div className='ml-auto flex items-center gap-4'>
            {jobListing.postedAt != null && (
              <div className='text-muted-foreground text-sm @max-lg:hidden'>
                {jobListing.postedAt.toLocaleString()}
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
          <ApplyButton jobListingId={jobListingId} />
        </Suspense>
      </div>

      <MarkdownRenderer source={jobListing.description} />
    </div>
  )
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  const { userId } = await getCurrentUser()
  if (userId == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className='flex flex-col gap-2'>
          You need to create an account before applying for a job.
          <SignUpButton />
        </PopoverContent>
      </Popover>
    )
  }
  // Check if we have already applied for this job
  const application = await getJobListingApplication({
    jobListingId,
    userId
  })

  // If we have already applied advise user
  if (application != null) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: 'short',
      numeric: 'always'
    })

    await connection()
    const difference = differenceInDays(application.createdAt, new Date())

    return (
      <div className='text-muted-foreground text-sm'>
        You applied for this job{' '}
        {difference === 0 ? 'today' : formatter.format(difference, 'days')}
      </div>
    )
  }

  // To apply for a job the user must have a resume
  const userResume = await getUserResume(userId)
  if (userResume == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className='flex flex-col gap-2'>
          You need to upload your resume before applying for a job.
          <Button asChild>
            <Link href='/user-settings/resume'>Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className='flex max-h-[calc(100%-2rem)] flex-col overflow-hidden md:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Applying for a job cannot be undone and is something you can only do
            once per job listing.
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto'>
          <NewJobListingApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

async function getUserResume(userId: string) {
  'use cache'
  cacheTag(getUserResumeIdTag(userId))

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId)
  })
}

async function getJobListingApplication({
  jobListingId,
  userId
}: {
  jobListingId: string
  userId: string
}) {
  'use cache'
  cacheTag(getJobListingApplicationIdTag({ jobListingId, userId }))

  return db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    )
  })
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
