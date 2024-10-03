import { functionInputSchema } from '@/inputSchema.js'
import { z } from 'zod'
import { systemInputSchema } from '@/types/systemInput.js'
import { inputFromJson } from '@/cmd/helpers.js'
import { CommandModule, Argv } from 'yargs'

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
  handler: (argv: any) => {
    type SystemInput = z.infer<typeof systemInputSchema>
    type FunctionInput = z.infer<typeof functionInputSchema>

    const systemInput = inputFromJson<SystemInput>(
      systemInputSchema,
      argv.system_inputs
    )
    const functionInput = inputFromJson<FunctionInput>(
      functionInputSchema,
      argv.function_defined_inputs
    )

    console.log(systemInput)
    console.log(functionInput)
    console.log(argv.speckle_token)
  }
}
