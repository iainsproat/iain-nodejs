import type { GetBlob } from '@/app/clients/blobStorage.js'
import { mkdir } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import * as tar from 'tar'

export const retrieveAndHydrateReportFactory = (deps: { getBlob: GetBlob }) => {
  const { getBlob } = deps
  return async (params: {
    speckleServerUrl: string
    projectId: string
    blobId: string
    token: string
  }) => {
    const blob = await getBlob({ ...params, streamId: params.projectId })

    await mkdir('./tmp/report', { recursive: true })
    await pipeline(
      blob.data,
      tar.x({
        cwd: './tmp/report'
      })
    )
  }
}
