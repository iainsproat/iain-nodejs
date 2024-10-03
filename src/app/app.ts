import { FunctionInput } from '@/types/inputSchema.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'
import { spawn } from 'node:child_process'

export type ObservableRunner = (params: {
  systemInput: SystemInput
  functionInput: FunctionInput
  speckleToken: SpeckleToken
}) => Promise<void>
export const observableRunnerFactory = (): ObservableRunner => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (_params) => {
    // const { systemInput, functionInput, speckleToken } = params
    console.log('🎶 I am running my application 🎶')
    //TODO pull markdown files from blob storage
    //TODO run this directly instead of via yarn
    const reason = await runProcessWithTimeout(
      'yarn',
      ['build:observable'],
      {},
      10 * 60 * 1000
    )
    console.log(`🎶 I am done running my application 🎶: ${JSON.stringify(reason)}`)
    //TODO store html to blob storage
  }
}

function handleData(data: Buffer | string) {
  try {
    Buffer.isBuffer(data) && (data = data.toString())
    data.split('\n').forEach((line) => {
      if (!line) return
      try {
        JSON.parse(line) // verify if the data is already in JSON format
        process.stdout.write(line)
        process.stdout.write('\n')
      } catch {
        wrapLogLine(line)
      }
    })
  } catch {
    wrapLogLine(JSON.stringify(data))
  }
}

function wrapLogLine(line: string) {
  console.log(line)
}

function runProcessWithTimeout(
  cmd: string,
  cmdArgs: string[],
  extraEnv: Record<string, string>,
  timeoutMs: number
) {
  return new Promise((resolve, reject) => {
    const childProc = spawn(cmd, cmdArgs, { env: { ...process.env, ...extraEnv } })

    childProc.stdout.on('data', (data: Buffer) => {
      handleData(data)
    })

    childProc.stderr.on('data', (data: Buffer) => {
      handleData(data)
    })

    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      childProc.kill(9)
      const rejectionReason = `Timeout: Process took longer than ${timeoutMs} milliseconds to execute.`

      reject(rejectionReason)
    }, timeoutMs)

    childProc.on('close', (code: number) => {
      if (timedOut) {
        return // ignore `close` calls after killing (the promise was already rejected)
      }

      clearTimeout(timeout)

      if (code === 0) {
        resolve({ status: 'success' })
      } else {
        reject({ status: 'fail', message: `Parser exited with code ${code}` })
      }
    })
  })
}
