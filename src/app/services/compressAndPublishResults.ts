import type { StoreBlob } from '@/app/clients/blobStorage.js'
import { fileFromPath } from 'formdata-node/file-from-path'
import * as tar from 'tar'
import cryptoRandomString from 'crypto-random-string'
import type { PublishAutomateResult } from '@/app/services/automateResults.js'

export const compressAndPublishResultsFactory = (deps: {
  storeBlob: StoreBlob
  publishAutomateResult: PublishAutomateResult
}) => {
  return async (params: {
    speckleServerUrl: string
    projectId: string
    token: string
    outputDirPath: string
  }) => {
    const { speckleServerUrl, projectId, token, outputDirPath } = params
    const tgzFileName = `/tmp/generated-${cryptoRandomString({ length: 10 })}.tgz`
    await tar.create({ gzip: true, file: tgzFileName }, [outputDirPath])
    const blob = await fileFromPath(tgzFileName)
    const blobStorageResult = await deps.storeBlob({
      speckleServerUrl,
      token,
      streamId: projectId,
      blob
    })
    const storedBlobId = blobStorageResult.uploadResults[0].blobId
    const publishedResult = await deps.publishAutomateResult({
      storedBlobId
    })

    return publishedResult
  }
}
