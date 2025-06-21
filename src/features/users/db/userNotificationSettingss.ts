import { db } from '@/db'
import { UserNotificationSettingsTable } from '@/db/schema'
import { revalidateUserNotificationSettingsCache } from './cache/userNottificationSettings'

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing()

  revalidateUserNotificationSettingsCache(settings.userId)
}

export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, 'userId'>
  >
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: UserNotificationSettingsTable.userId,
      set: settings
    })

  revalidateUserNotificationSettingsCache(userId)
}
