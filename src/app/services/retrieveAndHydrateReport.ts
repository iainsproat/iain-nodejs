import type { GetBlob } from '@/app/clients/blobStorage.js'
import { mkdir } from 'node:fs/promises'
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

    await mkdir('/tmp/report', { recursive: true })
    //FIXME is this async? how to await this?
    blob.data.pipe(
      tar.x({
        cwd: '/tmp/report'
      })
    )
  }
}
