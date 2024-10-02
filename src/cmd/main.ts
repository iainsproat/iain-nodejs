import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { defaultCommand } from '@/cmd/default.js'

const parsedArgs = await yargs(hideBin(process.argv))
  .scriptName('yarn start')
  .command(
    defaultCommand.command,
    defaultCommand.describe,
    defaultCommand.builder,
    defaultCommand.handler
  )
  .help()
  .parse()
