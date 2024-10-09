import { getLogger } from '@speckle/shared/dist/commonjs/observability/index.js'

export const logger = getLogger(
  process.env.LOG_LEVEL || 'info',
  process.env.LOG_PRETTY === 'true'
)
