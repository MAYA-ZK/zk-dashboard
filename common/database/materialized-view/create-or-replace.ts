import { Option, program } from 'commander'
import fs from 'fs'

const CHOICES = ['scroll', 'polygon-zk-evm', 'zk-sync-era'] as const
program
  .addOption(
    new Option(
      '-t, --target <target>',
      'Create or replace materialized views for a specific target'
    )
      .makeOptionMandatory(true)
      .choices(CHOICES)
  )
  .parse()

const options = program.opts<{ target?: (typeof CHOICES)[number] }>()

import('dotenv').then(async ({ config }) => {
  if (fs.existsSync('./.env')) {
    config()
  } else {
    config({ path: '../.env' })
  }
  const { client } = await import('../utils')

  const { createOrReplaceScrollMaterializedViews } = await import('./scroll')
  const { createOrReplacePolygonZkEvmMaterializedViews } = await import(
    './polygon-zk-evm'
  )
  const { creatOrReplaceZkSyncEraMaterializedViews } = await import(
    './zk-sync-era'
  )

  const createOrReplaceScrollMv = async () => {
    console.log('Creating materialized views for Scroll...')
    await createOrReplaceScrollMaterializedViews()
    console.log('Materialized views for Scroll created!')
  }

  const createOrReplacePolygonZkEvmMv = async () => {
    console.log("Creating materialized views for Polygon's ZK-EVM...")
    await createOrReplacePolygonZkEvmMaterializedViews()
    console.log("Materialized views for Polygon's ZK-EVM created!")
  }

  const createOrReplaceZkSyncEraMv = async () => {
    console.log('Creating materialized views for zkSync era...')
    await creatOrReplaceZkSyncEraMaterializedViews()
    console.log('Materialized views for zkSync era created!')
  }

  console.log('Creating materialized views...')
  if (options.target === 'scroll') {
    await createOrReplaceScrollMv()
  }
  if (options.target === 'polygon-zk-evm') {
    await createOrReplacePolygonZkEvmMv()
  }
  if (options.target === 'zk-sync-era') {
    await createOrReplaceZkSyncEraMv()
  }
  console.log('Materialized views created!')

  console.log('Closing connection...')
  await client.end()
  console.log('Connection closed!')
})

export {}
