'use client'

import { generateUploadDropzone } from '@uploadthing/react'
import { CustomFileRouter } from '../router'
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UploadThingError } from 'uploadthing/server'
import { Json } from '@uploadthing/shared'

const UploadDropzoneComponent = generateUploadDropzone<CustomFileRouter>()

export function UploadDropzone({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) {
  return (
    <UploadDropzoneComponent
      {...props}
      className={cn(
        'border-muted flex items-center justify-center rounded-lg border-2 border-dashed',
        className
      )}
      onClientUploadComplete={res => {
        res.forEach(() => {
          // toast.success(serverData.message)
          alert('Upload Completed')
        })
        onClientUploadComplete?.(res)
      }}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error.message)
        onUploadError?.(error)
      }}
    />
  )
}
