import type { GqlClient } from '@/app/clients/graphql.js'
import { gql } from 'graphql-request'
import { z } from 'zod'

// const automationResultCase = z.object({
//   category: z.string(),
//   level: z.string(), //TODO
//   objectIds: z.string().array(),
//   message: z.string().optional(),
//   metadata: z.record(z.any()).optional(),
//   visualOverrides: z.record(z.any()).optional()
// })

// const automationResultSchema = z.object({
//   elapsed: z.number().default(0),
//   resultView: z.string().optional(),
//   resultVersions: z.string().array(),
//   blobs: z.string().array(),
//   runStatus: z
//     .union([
//       z.literal('INITIALIZING'),
//       z.literal('RUNNING'),
//       z.literal('FAILED'),
//       z.literal('SUCCEEDED'),
//       z.literal('EXCEPTION')
//     ])
//     .default('RUNNING'),
//   statusMessage: z.string().optional(),
//   objectResults: automationResultCase.array()
// })

// type AutomationResult = z.infer<typeof automationResultSchema>

const blobMetadataSchema = z.object({
  createdAt: z.string(),
  fileHash: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number().optional(),
  fileType: z.string(),
  id: z.string(),
  streamId: z.string(),
  uploadError: z.string().optional(),
  uploadStatus: z.number(),
  userId: z.string()
})

type BlobMetadata = z.infer<typeof blobMetadataSchema>

export type PublishAutomateResult = (params: {
  storedBlobId: string
}) => Promise<BlobMetadata>

export const publishAutomateResultFactory = (deps: {
  gqlClient: GqlClient
}): PublishAutomateResult => {
  const { gqlClient } = deps

  return async (params) => {
    const { storedBlobId } = params
    const completeAutomationResult = await gqlClient({
      graphqlDocument: gql`{
        mutation automateFunctionRunStatusReport($storedBlobId: String!) {
          blobs: [
            $storedBlobId
          ]
        }
      }`,
      variables: {
        storedBlobId
      }
    })

    return blobMetadataSchema.parse(completeAutomationResult)
  }
}
