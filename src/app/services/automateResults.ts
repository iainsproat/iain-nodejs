import type { GqlClient } from '@/app/clients/graphql.js'
import { gql } from 'graphql-request'
import { z } from 'zod'

const automationFunctionRunStatusReportResultSchema = z.object({
  automateFunctionRunStatusReport: z.boolean()
})

type AutomationFunctionRunStatusReportResult = z.infer<typeof automationFunctionRunStatusReportResultSchema>

export type PublishAutomateResult = (params: {
  functionRunId: string
  storedBlobId: string
}) => Promise<AutomationFunctionRunStatusReportResult>

export const publishAutomateResultFactory = (deps: {
  gqlClient: GqlClient
}): PublishAutomateResult => {
  const { gqlClient } = deps

  return async (params) => {
    const { functionRunId, storedBlobId } = params
    const completeAutomationResult = await gqlClient({
      graphqlDocument: gql`
        mutation AutomateFunctionRunStatusReport(
          $functionRunId: String!
          $status: AutomateRunStatus!
          $statusMessage: String
          $objectResults: [JSONObject]
          $blobIds: [String]
          $contextView: String
        ) {
          automateFunctionRunStatusReport(
            input: {
              functionRunId: $functionRunId
              status: $status
              statusMessage: $statusMessage
              contextView: $contextView
              results: {
                version: 1
                values: { objectResults: $objectResults, blobIds: $blobIds }
              }
            }
          )
        }
      `,
      variables: {
        functionRunId,
        status: 'SUCCEEDED',
        statusMessage: 'Report has been generated and uploaded',
        objectResults: [],
        blobIds: [storedBlobId],
        contextView: ''
      }
    })

    return automationFunctionRunStatusReportResultSchema.parse(completeAutomationResult)
  }
}
