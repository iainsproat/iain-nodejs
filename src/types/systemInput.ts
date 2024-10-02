import { z } from 'zod'

export const systemInputSchema = z.object({
  automationId: z.string(),
})