'use server'

import * as z from 'zod/v4'
import { jobListingSchema } from './schema'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { redirect } from 'next/navigation'
import { insertJobListing } from '../db/jobListing'

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization()

  if (orgId == null)
    return {
      error: true,
      message: "You don't have permission to create a job listing"
    }

  const { success, data } = jobListingSchema.safeParse(unsafeData)
  if (!success) {
    return {
      error: true,
      message: 'There was an error creating your job listing'
    }
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: 'draft'
  })

  redirect(`/employer/job-listings/${jobListing.id}`)
}
