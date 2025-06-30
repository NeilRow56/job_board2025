import { z } from 'zod/v4'

export const newJobListingApplicationSchema = z.object({
  coverLetter: z
    .string()
    .transform(val => (val.trim() === '' ? null : val))
    .nullable()
})
