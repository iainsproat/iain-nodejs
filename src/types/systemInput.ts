import { z } from 'zod'

export const systemInputSchema = z.object({
  automationId: z.string(),
  projectId: z.string(),
  modelId: z.string(),
  branchName: z.string(),
  versionId: z.string(),
  speckleServerUrl: z.string(),
  automationRevisionId: z.string(),
  automationRunId: z.string(),
  functionId: z.string(),
  functionRunId: z.string(),
  functionName: z.string(),
  functionLogo: z.string()
})

export type SystemInput = z.infer<typeof systemInputSchema>
