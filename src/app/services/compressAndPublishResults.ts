import type { StoreBlob } from '@/app/clients/blobStorage.js'
import { fileFromPath } from 'formdata-node/file-from-path'
import * as tar from 'tar'
import cryptoRandomString from 'crypto-random-string'
import type { PublishAutomateResult } from '@/app/services/automateResults.js'
import { CreateTestRun } from './testAutomationRun.js'

export const compressAndPublishResultsFactory = (deps: {
  storeBlob: StoreBlob
  createTestRun: CreateTestRun
  publishAutomateResult: PublishAutomateResult
}) => {
  return async (params: {
    speckleServerUrl: string
    projectId: string
    automationId: string
    functionRunId: string
    token: string
    outputDirPath: string
  }) => {
    const {
      speckleServerUrl,
      projectId,
      automationId,
      functionRunId,
      token,
      outputDirPath
    } = params
    const tgzFileName = `./tmp/generated-${cryptoRandomString({ length: 10 })}.tgz`
    await tar.create({ gzip: true, file: tgzFileName }, [outputDirPath])
    const blob = await fileFromPath(tgzFileName)
    const blobStorageResult = await deps.storeBlob({
      speckleServerUrl,
      token,
      streamId: projectId,
      blob
    })
    const storedBlobId = blobStorageResult.uploadResults[0].blobId

    let fRunId = functionRunId

    // if we are testing locally, we are provided with an empty automationRunId
    if (!functionRunId) {
      const createTestRunResult = await deps.createTestRun({
        automationId,
        projectId
      })
      fRunId = createTestRunResult.projectMutations.automationMutations.createTestAutomationRun.functionRunId
    }

    const publishedResult = await deps.publishAutomateResult({
      functionRunId: fRunId,
      storedBlobId
    })

    return publishedResult.automateFunctionRunStatusReport
  }
}
