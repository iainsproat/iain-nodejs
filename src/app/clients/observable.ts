import { LimitedFunctionData } from '@/types/limitedFunctionData.js'
import { SystemInput } from '@/types/systemInput.js'
import { SpeckleToken } from '@/types/tokenSchema.js'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

export const buildObservable = async (
  params: { timeOutSeconds: number },
  systemInput: SystemInput,
  speckleToken: SpeckleToken
) => {
  const { timeOutSeconds } = params
  await mkdir('/tmp/generated', { recursive: true })

  const envData: LimitedFunctionData = {
    speckleServerUrl: systemInput.speckleServerUrl,
    versionId: systemInput.versionId,
    modelId: systemInput.modelId,
    projectId: systemInput.projectId,
    speckleToken
  }

  const reason = await runProcessWithTimeout(
    'yarn',
    ['build:observable'],
    { AUTOMATE_DATA: JSON.stringify(envData) },
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

    childProc.stdout.on('data', handleData)

    childProc.stderr.on('data', handleData)

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
