import { JobListingTable } from '@/db/schema'
import { revalidateJobListingCache } from './cache/jobListings'
import { db } from '@/db'

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert
) {
  const [newListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId
    })

  revalidateJobListingCache(newListing)

  // return {
  //   newListing,
  //   message: `Job Listing ID #${newListing.id} created successfully`
  // }
  return newListing
}
