import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default function NotificationsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  )
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser()
  if (userId == null) return notFound()

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>Suspended Form</Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
