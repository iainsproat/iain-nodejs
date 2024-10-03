import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

export const buildObservable = async (params: { timeOutSeconds: number }) => {
  const { timeOutSeconds } = params
  await mkdir('/tmp/generated', { recursive: true })
  const reason = await runProcessWithTimeout(
    'yarn',
    ['build:observable'],
    {},
    timeOutSeconds * 1000
  )
  return reason
}

function runProcessWithTimeout(
  cmd: string,
  cmdArgs: string[],
  extraEnv: Record<string, string>,
  timeoutMs: number
) {
  return new Promise((resolve, reject) => {
    const childProc = spawn(cmd, cmdArgs, { env: { ...process.env, ...extraEnv } })

    childProc.stdout.on('data', () => {
      //TODO log?
    })

    childProc.stderr.on('data', () => {
      //TODO log?
    })

    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      childProc.kill(9)
      const rejectionReason = `Timeout: Process took longer than ${timeoutMs} milliseconds to execute.`

      reject({ status: 'fail', message: rejectionReason })
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
