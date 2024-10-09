import { csvFormat } from 'd3-dsv'
import ObjectLoader from '@speckle/objectloader'
import { gql, request } from 'graphql-request'

if (!process.env.AUTOMATE_DATA) {
  throw new Error('AUTOMATE_DATA environment variable is not set')
}

const automateData = JSON.parse(process.env.AUTOMATE_DATA)

const query = gql`
  query Project($projectId: String!, $versionId: String!) {
    project(id: $projectId) {
      version(id: $versionId) {
        referencedObject
      }
    }
  }
`

const endpoint = `${automateData.speckleServerUrl}/graphql/`

const response = await request(endpoint, query, {
  projectId: automateData.projectId,
  versionId: automateData.versionId
})
const objectId = response.project.version.referencedObject

const loader = new ObjectLoader({
  serverUrl: automateData.speckleServerUrl,
  token: automateData.speckleToken,
  streamId: automateData.projectId,
  objectId,
  options: {
    customLogger: () => 1 + 2
  }
})

const objects = []
for await (const obj of loader.getObjectIterator()) {
  objects.push(obj)
}
console.clear()

process.stdout.write(csvFormat(objects))
