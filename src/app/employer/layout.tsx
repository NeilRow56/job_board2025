import { AsyncIf } from '@/components/AsyncIf'
import { AppSidebar } from '@/components/sidebar/AppSidebar'
import { SidebarNavMenuGroup } from '@/components/sidebar/SidebarNavMenuGroup'

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar'
import { db } from '@/db'
import { JobListingApplicationTable, JobListingTable } from '@/db/schema'
import { getJobListingApplicationJobListingTag } from '@/features/jobListingApplications/db/cache/jobListingApplications'
import { getJobListingOrganizationTag } from '@/features/jobListings/db/cache/jobListings'

import { SidebarOrganizationButton } from '@/features/organizations/components/SidebarOrganizationButton'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions'
import { count, desc, eq } from 'drizzle-orm'

import { ClipboardListIcon, PlusIcon } from 'lucide-react'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'

import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ReactNode, Suspense } from 'react'

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return redirect('/organizations/select')
  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() => hasOrgUserPermission('org:job_listings:create')}
            >
              <SidebarGroupAction title='Add Job Listing' asChild>
                <Link href='/employer/job-listings/new'>
                  <PlusIcon /> <span className='sr-only'>Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className='group-data-[state=collapsed]:hidden'>
              <Suspense>
                <JobListingMenu orgId={orgId} />
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

async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId)
  console.log(jobListings)
  return null
}
//The LEFT JOIN keyword returns all records from the left table (table1), and the matching records from the right table (table2). The result is 0 records from the right side, if there is no match.
//The RIGHT JOIN keyword returns all records from the right table (table2), and the matching records from the left table (table1). The result is 0 records from the left side, if there is no match.
//The INNER JOIN keyword selects records that have matching values in both tables.
async function getJobListings(orgId: string) {
  'use cache'
  cacheTag(getJobListingOrganizationTag(orgId))

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId)
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId)
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt))

  data.forEach(jobListing => {
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id))
  })

  return data
}
