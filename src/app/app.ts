import { FunctionInput } from '@/types/inputSchema.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'
import { buildObservable } from '@/app/clients/observable.js'
import { retrieveAndHydrateReportFactory } from './service/retrieveAndHydrateReport.js'
import { getBlob } from '@/app/clients/blobStorage.js'

export type ObservableRunner = (params: {
  systemInput: SystemInput
  functionInput: FunctionInput
  speckleToken: SpeckleToken
}) => Promise<void>
export const observableRunnerFactory = (): ObservableRunner => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (params) => {
    const { systemInput, functionInput, speckleToken } = params
    console.log('🎶 I am running my application 🎶')
    await (retrieveAndHydrateReportFactory({
      getBlob
    }))({
      ...systemInput,
      ...functionInput,
      token: speckleToken
    })
    //TODO run this directly instead of via yarn
    const result = await buildObservable({ timeOutSeconds: 10 * 60 })
    console.log(`🎶 I am done running my application 🎶: ${JSON.stringify(result)}`)
    //TODO store html to blob storage
  }
}
