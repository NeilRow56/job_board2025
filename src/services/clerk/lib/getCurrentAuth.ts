import { db } from '@/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { UserTable } from '@/db/schema'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { getUserIdTag } from '@/features/users/db/cache/users'

export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth()

  return {
    userId,
    user: allData && userId != null ? await getUser(userId) : undefined
  }
}

async function getUser(id: string) {
  'use cache'
  cacheTag(getUserIdTag(id))
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id)
  })
}
