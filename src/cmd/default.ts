import { FunctionInput, functionInputSchema } from '@/types/inputSchema.js'
import { z } from 'zod'
import { systemInputSchema, SystemInput } from '@/types/systemInput.js'
import { speckleTokenSchema } from '@/types/tokenSchema.js'

import { inputFromJson } from '@/cmd/helpers.js'
import { Argv } from 'yargs'
import { observableRunnerFactory } from '@/app/app.js'

export const defaultCommand = {
  command: '$0 <system_inputs> <function_defined_inputs> <speckle_token>',
  describe: 'default command',
  builder: (yargs: Argv<{}>) => {
    return yargs
      .positional('system_inputs', {
        describe:
          'A JSON stringified object containing automation inputs from the automation execution system',
        type: 'string'
      })
      .positional('function_defined_inputs', {
        describe:
          'A JSON stringified object containing automation inputs defined in the function',
        type: 'string'
      })
      .positional('speckle_token', {
        describe:
          'A string containing the speckle token for the user who triggered the automation',
        type: 'string'
      })
  },
  handler: async (argv: any) => {
    const systemInput = inputFromJson<SystemInput>(
      systemInputSchema,
      argv.system_inputs
    )
    const functionInput = inputFromJson<FunctionInput>(
      functionInputSchema,
      argv.function_defined_inputs
    )

    const tokenInput = speckleTokenSchema.parse(argv.speckle_token)
    console.log(systemInput)
    console.log(functionInput)
    console.log(tokenInput)

    const observableRunner = await (observableRunnerFactory())({
      systemInput,
      functionInput,
      speckleToken: tokenInput
    })
  }
}
