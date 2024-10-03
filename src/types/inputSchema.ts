import { z } from 'zod'

export const functionInputSchema = z.object({
  blobId: z.string(),
})

export type FunctionInput = z.infer<typeof functionInputSchema>
