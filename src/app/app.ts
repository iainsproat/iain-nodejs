import { FunctionInput } from '@/types/inputSchema.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'
import { buildObservable } from '@/app/clients/observable.js'
import { retrieveAndHydrateReportFactory } from '@/app/services/retrieveAndHydrateReport.js'
import { getBlob, storeBlob } from '@/app/clients/blobStorage.js'
import { compressAndPublishResultsFactory } from '@/app/services/compressAndPublishResults.js'
import { publishAutomateResultFactory } from '@/app/services/automateResults.js'
import { graphqlClientFactory } from '@/app/clients/graphql.js'

export type ObservableRunner = (params: {
  systemInput: SystemInput
  functionInput: FunctionInput
  speckleToken: SpeckleToken
}) => Promise<void>
export const observableRunnerFactory = (): ObservableRunner => {
  return async (params) => {
    const { systemInput, functionInput, speckleToken } = params
    console.log('💙 Retrieving input report')
    await retrieveAndHydrateReportFactory({
      getBlob
    })({
      ...systemInput,
      ...functionInput,
      token: speckleToken
    })

    const result = await buildObservable(
      { timeOutSeconds: 10 * 60 },
      systemInput,
      speckleToken
    )
    console.log(`🚀 Built the Observable application 🎶: ${JSON.stringify(result)}`)

    const gqlClient = graphqlClientFactory({
      speckleServerUrl: systemInput.speckleServerUrl,
      speckleToken
    })

    const publishResults = await compressAndPublishResultsFactory({
      storeBlob,
      publishAutomateResult: publishAutomateResultFactory({
        gqlClient
      })
    })({
      ...systemInput,
      ...functionInput,
      token: speckleToken,
      outputDirPath: '/tmp/generated'
    })
    console.log(
      `🏁 Published the Observable application: ${JSON.stringify(publishResults)}`
    )
  }
}
