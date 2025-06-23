import { Card, CardContent } from '@/components/ui/card'
import { JobListingForm } from '@/features/jobListings/components/JobListingForm'

export default function NewJobListingPage() {
  return (
    <div className='mx-auto max-w-5xl p-4'>
      <h1 className='mb-2 text-2xl font-bold'>New Job Listing</h1>
      <p className='text-muted-foreground mb-6'>
        This does not post the listing yet. It just saves a draft.
      </p>
      <Card>
        <CardContent>
          <JobListingForm />
        </CardContent>
      </Card>
    </div>
  )
}
