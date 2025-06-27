import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { notFound } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatJobListingStatus } from '@/features/jobListings/lib/formatters'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import Link from 'next/link'
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRender'

import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings'
import { db } from '@/db'
import { and, eq } from 'drizzle-orm'
import { JobListingStatus, JobListingTable } from '@/db/schema'
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions'
import { AsyncIf } from '@/components/AsyncIf'
import { getNextJobListingStatus } from '@/features/jobListings/lib/utils'

import { hasReachedMaxFeaturedJobListings } from '@/features/jobListings/lib/planfeatureHelpers'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ActionButton } from '@/components/ActionButton'
import {
  toggleJobListingFeatured,
  toggleJobListingStatus
} from '@/features/jobListings/actions/job-list-actions'

// import { ActionButton } from '@/components/ActionButton'

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default function JoblistingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return null
  const { jobListingId } = await params
  const jobListing = await getJobListing(jobListingId, orgId)
  if (jobListing == null) return notFound()
  return (
    <div className='@container mx-auto max-w-6xl space-y-6 p-4'>
      <div className='flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start'>
        <div className='bg-muted-foreground/10 rounded-md'>
          <h1 className='px-1 text-2xl font-bold tracking-tight'>
            {jobListing.title}
          </h1>
          <div className='mt-2 flex flex-wrap gap-2 px-1 pb-4'>
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className='flex items-center gap-2 empty:-mt-4'>
          <AsyncIf
            condition={() => hasOrgUserPermission('org:job_listings:update')}
          >
            <Button asChild variant='outline'>
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                <EditIcon className='size-4' />
                Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === 'published' && (
            <FeaturedToggleButton
              isFeatured={jobListing.isFeatured}
              id={jobListing.id}
            />
          )}
        </div>
      </div>
      <MarkdownPartial
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={
          <MarkdownRenderer
            className='prose-sm'
            source={jobListing.description}
          />
        }
        dialogTitle='Description'
      />
    </div>
  )
}

function StatusUpdateButton({
  status,
  id
}: {
  status: JobListingStatus
  id: string
}) {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant='outline'
      requireAreYouSure={getNextJobListingStatus(status) === 'published'}
      areYouSureDescription='This will immediately show this job listing to all users.'
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  )

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('org:job_listings:change_status')}
    >
      {getNextJobListingStatus(status) === 'published' ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings()

            return !isMaxed
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText='You must upgrade your plan to publish more job listings.'
            />
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  )
}

function FeaturedToggleButton({
  isFeatured,
  id
}: {
  isFeatured: boolean
  id: string
}) {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant='outline'
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  )

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('org:job_listings:change_status')}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings()
            return !isMaxed
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText='You must upgrade your plan to feature more job listings.'
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  )
}

function UpgradePopover({
  buttonText,
  popoverText
}: {
  buttonText: ReactNode
  popoverText: ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className='flex flex-col gap-2'>
        {popoverText}
        <Button asChild>
          <Link href='/employer/pricing'>Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case 'delisted':
    case 'draft':
      return (
        <>
          <EyeIcon className='size-4' />
          Publish
        </>
      )
    case 'published':
      return (
        <>
          <EyeOffIcon className='size-4' />
          Delist
        </>
      )
    default:
      throw new Error(`Unknown status: ${status satisfies never}`)
  }
}

function featuredToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className='size-4' />
        UnFeature
      </>
    )
  }

  return (
    <>
      <StarIcon className='size-4' />
      Feature
    </>
  )
}

async function getJobListing(id: string, orgId: string) {
  'use cache'
  cacheTag(getJobListingIdTag(id))

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    )
  })
}
