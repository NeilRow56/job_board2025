import { UserResumeTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidateUserResumeCache } from './cache/userResume'
import { db } from '@/db'

export async function upsertUserResume(
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, 'userId'>
) {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: data
    })

  revalidateUserResumeCache(userId)
}

export async function updateUserResume(
  userId: string,
  data: Partial<Omit<typeof UserResumeTable.$inferInsert, 'userId'>>
) {
  await db
    .update(UserResumeTable)
    .set(data)
    .where(eq(UserResumeTable.userId, userId))

  revalidateUserResumeCache(userId)
}
