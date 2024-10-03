import { z } from 'zod'

export const speckleTokenSchema = z.string()

export type SpeckleToken = z.infer<typeof speckleTokenSchema>
