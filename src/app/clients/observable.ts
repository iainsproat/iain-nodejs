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
  await mkdir('./tmp/generated', { recursive: true })

  const envData: LimitedFunctionData = {
    speckleServerUrl: systemInput.speckleServerUrl,
    versionId: systemInput.versionId,
    modelId: systemInput.modelId,
    projectId: systemInput.projectId,
    speckleToken
  }

  // const installDependencies = await runProcessWithTimeout({
  //   cmd: 'yarn',
  //   cmdArgs: ['install'],
  //   extraEnv: {},
  //   timeoutMs: timeOutSeconds * 1000,
  //   cwd: './tmp/report'
  // })
  // if (installDependencies.status === 'fail') {
  //   return installDependencies
  // }

  const reason = await runProcessWithTimeout({
    cmd: 'yarn',
    cmdArgs: ['build:observable'],
    extraEnv: { AUTOMATE_DATA: JSON.stringify(envData) },
    timeoutMs: timeOutSeconds * 1000
  })
  return reason
}

function runProcessWithTimeout(params: {
  cmd: string
  cmdArgs: string[]
  extraEnv: Record<string, string>
  timeoutMs: number
  cwd?: string
}) {
  const { cmd, cmdArgs, extraEnv, timeoutMs } = params
  return new Promise<{ status: 'fail' | 'success'; message?: string }>(
    (resolve, reject) => {
      // need to pass process.env so that PATH is present and 'yarn' is discoverable
      const childProc = spawn(cmd, cmdArgs, { env: { ...process.env, ...extraEnv }})

      childProc.stdout.setEncoding('utf8')
      childProc.stdout.on('data', handleData)

      childProc.stderr.setEncoding('utf8')
      childProc.stderr.on('data', handleData)

      childProc.on('error', (err) => {
        reject({ status: 'fail', message: JSON.stringify(err) })
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
    }
  )
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
