import { db } from '@/db'
import { JobListingTable } from '@/db/schema'
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { and, eq } from 'drizzle-orm'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatJobListingStatus } from '@/features/jobListings/lib/formatters'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import Link from 'next/link'
import { EditIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRender'

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
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {jobListing.title}
          </h1>
          <div className='mt-2 flex flex-wrap gap-2'>
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className='flex items-center gap-2 empty:-mt-4'>
          <Button asChild variant='outline'>
            <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
              <EditIcon className='size-4' />
              Edit
            </Link>
          </Button>
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
