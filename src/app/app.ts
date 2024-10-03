import { FunctionInput } from '@/types/inputSchema.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'
import { spawn } from 'child_process'

export type ObservableRunner = (params: {
  systemInput: SystemInput
  functionInput: FunctionInput
  speckleToken: SpeckleToken
}) => Promise<void>
export const observableRunnerFactory = (): ObservableRunner => {
  return async (params) => {
    const { systemInput, functionInput, speckleToken } = params
    console.log('🎶 I am running my application 🎶')
    const reason = await runProcessWithTimeout('yarn', ['build:observable'], {}, 10000)
    console.log(`🎶 I am done running my application 🎶: ${JSON.stringify(reason)}`)
  }
}

function runProcessWithTimeout(
  cmd: string,
  cmdArgs: string[],
  extraEnv: Record<string, string>,
  timeoutMs: number
) {
  return new Promise((resolve, reject) => {
    const childProc = spawn(cmd, cmdArgs, { env: { ...process.env, ...extraEnv } })

    childProc.stdout.on('data', (data: unknown) => {
      // handleData(data, false, boundLogger)
    })

    childProc.stderr.on('data', (data: unknown) => {
      // handleData(data, true, boundLogger)
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
