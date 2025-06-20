import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './schema-helpers'

export const UserTable = pgTable('users', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar().notNull(),
  email: varchar().notNull().unique(),
  createdAt,
  updatedAt
})

export const OrganizationTable = pgTable('organizations', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt
})

export const wageIntervals = ['hourly', 'yearly'] as const
export type WageInterval = (typeof wageIntervals)[number]
export const wageIntervalEnum = pgEnum(
  'job_listings_wage_interval',
  wageIntervals
)

export const locationRequirements = ['in-office', 'hybrid', 'remote'] as const
export type LocationRequirement = (typeof locationRequirements)[number]
export const locationRequirementEnum = pgEnum(
  'job_listings_location_requirement',
  locationRequirements
)

export const experienceLevels = ['junior', 'mid-level', 'senior'] as const
export type ExperienceLevel = (typeof experienceLevels)[number]
export const experienceLevelEnum = pgEnum(
  'job_listings_experience_level',
  experienceLevels
)

export const jobListingStatuses = ['draft', 'published', 'delisted'] as const
export type JobListingStatus = (typeof jobListingStatuses)[number]
export const jobListingStatusEnum = pgEnum(
  'job_listings_status',
  jobListingStatuses
)

export const jobListingTypes = ['internship', 'part-time', 'full-time'] as const
export type JobListingType = (typeof jobListingTypes)[number]
export const jobListingTypeEnum = pgEnum('job_listings_type', jobListingTypes)

export const JobListingTable = pgTable(
  'job_listings',
  {
    id,
    organizationId: varchar()
      .references(() => OrganizationTable.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default('draft'),
    type: jobListingTypeEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt
  },
  // index to help search speed
  table => [index().on(table.stateAbbreviation)]
)

export const applicationStages = [
  'denied',
  'applied',
  'interested',
  'interviewed',
  'hired'
] as const
export type ApplicationStage = (typeof applicationStages)[number]
export const applicationStageEnum = pgEnum(
  'job_listing_applications_stage',
  applicationStages
)

export const JobListingApplicationTable = pgTable(
  'job_listing_applications',
  {
    jobListingId: uuid()
      .references(() => JobListingTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar()
      .references(() => UserTable.id, { onDelete: 'cascade' })
      .notNull(),
    coverLetter: text(),
    rating: integer(),
    stage: applicationStageEnum().notNull().default('applied'),
    createdAt,
    updatedAt
  },
  // We are using the job listing id and user id as a "joint id " for the primary key
  table => [primaryKey({ columns: [table.jobListingId, table.userId] })]
)

export const OrganizationUserSettingsTable = pgTable(
  'organization_user_settings',
  {
    userId: varchar()
      .notNull()
      .references(() => UserTable.id),
    organizationId: varchar()
      .notNull()
      .references(() => OrganizationTable.id),

    newApplicationEmailNotifications: boolean().notNull().default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt
  },
  table => [primaryKey({ columns: [table.userId, table.organizationId] })]
)

export const UserNotificationSettingsTable = pgTable(
  'user_notification_settings',
  {
    userId: varchar()
      .primaryKey()
      .references(() => UserTable.id),
    newJobEmailNotifications: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt
  }
)

export const UserResumeTable = pgTable('user_resumes', {
  userId: varchar()
    .primaryKey()
    .references(() => UserTable.id),
  resumeFileUrl: varchar().notNull(),
  resumeFileKey: varchar().notNull(),
  aiSummary: varchar(),
  createdAt,
  updatedAt
})
