import type { GetBlob } from '@/app/clients/blobStorage.js'
import { createWriteStream } from 'node:fs'
import zlib from 'zlib'

export const retrieveAndHydrateReportFactory = (deps: { getBlob: GetBlob }) => {
  const { getBlob } = deps
  return async (params: {
    speckleServerUrl: string
    projectId: string
    blobId: string
    token: string
  }) => {
    const blob = await getBlob({ ...params, streamId: params.projectId })
    const gzipStream = zlib.createGzip()
    const writeStream = createWriteStream('/tmp/generated')

    blob.data.pipe(gzipStream).pipe(writeStream)
  }
}
