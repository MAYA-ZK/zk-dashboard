import fs from 'fs'

import('dotenv').then(async ({ config }) => {
  if (fs.existsSync('./.env')) {
    config()
  } else {
    config({ path: '../.env' })
  }

  const { createOrReplaceScrollBatchesMV } = await import('./scroll')
  const { client } = await import('../utils')

  const createOrReplaceMaterializedView = async () => {
    await Promise.all([createOrReplaceScrollBatchesMV()])
  }

  console.log('Creating materialized views...')
  await createOrReplaceMaterializedView()
  console.log('Materialized views created!')

  console.log('Closing connection...')
  await client.end()
  console.log('Connection closed!')
})

export {}
