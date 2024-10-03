import axios from 'axios'
import { Readable } from 'stream'

export type GetBlob = (params: {
  speckleServerUrl: string
  streamId: string
  blobId: string
  token: string
}) => Promise<{ filename: string; data: Readable }>

export const getBlob: GetBlob = async (params) => {
  const { speckleServerUrl, streamId, blobId, token } = params
  const response = await axios.get(
    `${speckleServerUrl}/api/stream/${streamId}/blob/${blobId}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'stream'
    }
  )
  const contentDisposition = response.headers['content-disposition'] as string
  const filename = fileNameFromContentDisposition(contentDisposition)
  return { filename, data: response.data as Readable }
}

const fileNameFromContentDisposition = (contentDisposition: string) => {
  return contentDisposition.split('filename=')[1].split(';')[0]
}
