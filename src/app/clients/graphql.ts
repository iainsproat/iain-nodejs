import { GraphQLClient } from 'graphql-request'

export type GqlClient = (params: {
  graphqlDocument: string
  variables: Record<string, unknown>
}) => Promise<unknown>

export const graphqlClientFactory = (deps: {
  speckleServerUrl: string
  speckleToken: string
}): GqlClient => {
  const { speckleServerUrl, speckleToken } = deps
  const gqlClient = new GraphQLClient(`${speckleServerUrl}/graphql`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${speckleToken}`
    }
  })

  return async (params) => {
    const { graphqlDocument, variables } = params

    return gqlClient.request(graphqlDocument, variables)
  }
}
