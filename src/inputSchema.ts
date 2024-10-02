import { z } from 'zod'

export const functionInputSchema = z.object({
  name: z.string(),
})