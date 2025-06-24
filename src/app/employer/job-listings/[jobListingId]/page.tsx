import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { Suspense } from 'react'

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default function JoblistingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return null
  const { jobListingId } = await params
  return (
    <div className='@container mx-auto max-w-6xl space-y-6 p-4'>
      {jobListingId}
    </div>
  )
}
