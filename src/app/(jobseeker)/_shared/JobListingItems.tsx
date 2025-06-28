import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { db } from '@/db'
import { JobListingTable, OrganizationTable } from '@/db/schema'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { convertSearchParamsToString } from '@/lib/convertSearchParamsToString'
import { cn } from '@/lib/utils'

import { and, desc, eq, or, SQL } from 'drizzle-orm'
import Link from 'next/link'

import { Suspense } from 'react'

type Props = {
  searchParams: Promise<Record<string, string | string[]>>
  params?: Promise<{ jobListingId: string }>
}

export function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  )
}

async function SuspendedComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined
  const search = await searchParams
  //TODO: zov validate
  const jobListings = await getJobListings(search, jobListingId)
  if (jobListings.length === 0) {
    return (
      <div className='text-muted-foreground p-4'>No job listings found</div>
    )
  }
  return (
    <div className='space-y-4'>
      {jobListings.map(jobListing => (
        <Link
          className='block'
          key={jobListing.id}
          href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(
            search
          )}`}
        >
          <JobListingListItem
            jobListing={jobListing}
            organization={jobListing.organization}
          />
        </Link>
      ))}
    </div>
  )
}

async function getJobListings(
  searchParams: unknown,
  jobListingId: string | undefined
) {
  //"use cache"

  const whereConditions: (SQL | undefined)[] = []

  // TODO: where Conditions

  return db.query.JobListingTable.findMany({
    //If we have an JobListinId - Is this "published" - an equals the job Listing table id
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.status, 'published'),
            eq(JobListingTable.id, jobListingId)
          )
        : undefined,
      and(...whereConditions)
    ),
    //Specify org information
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true
        }
      }
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)]
  })
}

function JobListingListItem({
  jobListing,
  organization
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | 'title'
    | 'stateAbbreviation'
    | 'city'
    | 'wage'
    | 'wageInterval'
    | 'experienceLevel'
    | 'type'
    | 'postedAt'
    | 'locationRequirement'
    | 'isFeatured'
  >
  organization: Pick<typeof OrganizationTable.$inferSelect, 'name' | 'imageUrl'>
}) {
  const nameInitials = organization?.name
    .split(' ')
    .splice(0, 4)
    .map(word => word[0])
    .join('')

  return (
    <Card
      className={cn(
        '@container',
        jobListing.isFeatured && 'border-featured bg-featured/20'
      )}
    >
      <CardHeader>
        <div className='flex gap-4'>
          <Avatar className='size-14 @max-sm:hidden'>
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className='bg-primary text-primary-foreground uppercase'>
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-xl'>{jobListing.title}</CardTitle>
            <CardDescription className='text-base'>
              {organization.name}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className='text-primary text-sm font-medium @min-md:hidden'>
                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                  {/* <DaysSincePosting postedAt={jobListing.postedAt} /> */}
                </Suspense>
              </div>
            )}
          </div>
          {jobListing.postedAt != null && (
            <div className='text-primary ml-auto text-sm font-medium @max-md:hidden'>
              <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                {/* <DaysSincePosting postedAt={jobListing.postedAt} /> */}
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? 'border-primary/35' : undefined}
        />
      </CardContent>
    </Card>
  )
}
