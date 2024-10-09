import { GqlClient } from '@/app/clients/graphql.js'
import { gql } from 'graphql-request'
import { z } from 'zod'

const testRunResultSchema = z.object({
  projectMutations: z.object({
    automationMutations: z.object({
      createTestAutomationRun: z.object({
        automationRunId: z.string(),
        functionRunId: z.string(),
        triggers: z
          .object({
            payload: z.object({
              modelId: z.string(),
              versionId: z.string()
            }),
            triggerType: z.string()
          })
          .array()
      })
    })
  })
})

type TestRunResult = z.infer<typeof testRunResultSchema>

export type CreateTestRun = (params: {
  automationId: string
  projectId: string
}) => Promise<TestRunResult>

export const createTestRunFactory = (deps: { gqlClient: GqlClient }): CreateTestRun => {
  const { gqlClient } = deps

  return async (params) => {
    const { automationId, projectId } = params
    const testRunResult = await gqlClient({
      graphqlDocument: gql`
        mutation CreateTestRun($projectId: ID!, $automationId: ID!) {
          projectMutations {
            automationMutations(projectId: $projectId) {
              createTestAutomationRun(automationId: $automationId) {
                automationRunId
                functionRunId
                triggers {
                  payload {
                    modelId
                    versionId
                  }
                  triggerType
                }
              }
            }
          }
        }
      `,
      variables: {
        projectId,
        automationId
      }
    })

    return testRunResultSchema.parse(testRunResult)
  }
}
