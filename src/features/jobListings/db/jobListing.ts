import { JobListingTable } from '@/db/schema'
import { revalidateJobListingCache } from './cache/jobListings'
import { db } from '@/db'
import { eq } from 'drizzle-orm'

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

export async function updateJobListingDB(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId
    })

  revalidateJobListingCache(updatedListing)

  return updatedListing
}
