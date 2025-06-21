import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { relations } from 'drizzle-orm'
import { JobListingTable } from './jobListing'
import { OrganizationUserSettingsTable } from './organizationUserSettings'
import { createdAt, updatedAt } from '../schema-helpers'

export const OrganizationTable = pgTable('organizations', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt
})

export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    jobListings: many(JobListingTable),
    organizationUserSettings: many(OrganizationUserSettingsTable)
  })
)
