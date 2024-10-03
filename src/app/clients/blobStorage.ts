import axios from 'axios'
import { Readable } from 'stream'
import { z } from 'zod'
import cryptoRandomString from 'crypto-random-string'

export type GetBlob = (params: {
  speckleServerUrl: string
  streamId: string
  blobId: string
  token: string
}) => Promise<{ filename: string; data: Readable }>

export const getBlob: GetBlob = async (params) => {
  const { speckleServerUrl, streamId, blobId, token } = params
  const response = await axios.get(
    `${speckleServerUrl}api/stream/${streamId}/blob/${blobId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    }
  )
  const contentDisposition = response.headers['content-disposition'] as string
  const filename = fileNameFromContentDisposition(contentDisposition)
  return { filename, data: response.data as Readable }
}

const storeBlobResponse = z.object({
  uploadResults: z
    .object({
      blobId: z.string(),
      fileName: z.string(),
      uploadStatus: z.number(),
      fileSize: z.number(),
      formKey: z.string()
    })
    .array()
})
type StoreBlobResponse = z.infer<typeof storeBlobResponse>
export type StoreBlob = (params: {
  speckleServerUrl: string
  streamId: string
  token: string
  blob: File
}) => Promise<StoreBlobResponse>

export const storeBlob: StoreBlob = async (params) => {
  const { speckleServerUrl, streamId, token, blob } = params
  const fileName = cryptoRandomString({ length: 10 })
  const form = new FormData()
  form.append(fileName, blob)

  const response = await axios.post(
    `${speckleServerUrl}api/stream/${streamId}/blob`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return storeBlobResponse.parse(response.data)
}

const fileNameFromContentDisposition = (contentDisposition: string) => {
  return contentDisposition.split('filename=')[1].split(';')[0]
}
