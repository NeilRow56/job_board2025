import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { relations } from 'drizzle-orm'
import { UserResumeTable } from './userResume'
import { UserNotificationSettingsTable } from './userNotificationSettings'
import { OrganizationUserSettingsTable } from './organizationUserSettings'
import { createdAt, updatedAt } from '../schema-helpers'

export const UserTable = pgTable('users', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar().notNull(),
  email: varchar().notNull().unique(),
  createdAt,
  updatedAt
})

export const userRelations = relations(UserTable, ({ one, many }) => ({
  notificationSettings: one(UserNotificationSettingsTable),
  resume: one(UserResumeTable),
  organizationUserSettings: many(OrganizationUserSettingsTable)
}))
