import { z } from 'zod'

export const functionInputSchema = z.object({
  name: z.string(),
})

export type FunctionInput = z.infer<typeof functionInputSchema>
