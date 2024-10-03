import { FunctionInput } from '@/types/inputSchema.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'

export type ObservableRunner = (params: {
  systemInput: SystemInput
  functionInput: FunctionInput
  speckleToken: SpeckleToken
}) => void
export const observableRunnerFactory = (): ObservableRunner => {
  return (params) => {
    const { systemInput, functionInput, speckleToken } = params
    console.log('🎶 I am running my application 🎶')
  }
}
