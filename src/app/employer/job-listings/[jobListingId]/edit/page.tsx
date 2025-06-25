import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/db'
import { JobListingTable } from '@/db/schema'

import { JobListingForm } from '@/features/jobListings/components/JobListingForm'
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { and, eq } from 'drizzle-orm'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default function EditJobListingPage(props: Props) {
  return (
    <div className='mx-auto max-w-5xl p-4'>
      <h1 className='mb-2 text-2xl font-bold'>Edit Job Listing</h1>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedPage({ params }: Props) {
  const { jobListingId } = await params
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return notFound()

  const jobListing = await getJobListing(jobListingId, orgId)
  if (jobListing == null) return notFound()

  return <JobListingForm jobListing={jobListing} />
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
