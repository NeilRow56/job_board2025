import { JobListingApplicationTable } from '@/db/schema'
import { revalidateJobListingApplicationCache } from './cache/jobListingApplications'
import { db } from '@/db'

export async function insertJobListingApplication(
  application: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(application)

  revalidateJobListingApplicationCache(application)
}
