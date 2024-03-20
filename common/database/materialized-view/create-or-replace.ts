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

  const {
    createOrReplaceScrollBatchCostMV,
    createOrReplaceScrollBatchAvgCostMV,
    createOrReplaceScrollBatchCreatedMv,
    createOrReplaceScrollBatchFinalityMv,
    createOrReplaceScrollAvgCostOfBatchesDateRange,
    createOrReplaceScrollBatchAvgDuration,
    createOrReplaceScrollNormalizationBatchedTxs,
  } = await import('./scroll')

  const {
    createOrReplacePolygonZkEvmBatchAvgCostMv,
    createOrReplacePolygonZkEvmBatchCostMv,
    createOrReplacePolygonZkEvmBatchCreatedMv,
    createOrReplacePolygonZkEvmBatchFinalityMv,
    createOrReplacePolygonZkEvmBatchAvgDuration,
    createOrReplacePolygonZkEvmAvgCostOfBatchesDateRange,
    createOrReplacePolygonZkEvmNormalizationBatchedTxs,
  } = await import('./polygon-zk-evm')

  const {
    createOrReplaceZkSyncEraBatchAvgCostMv,
    createOrReplaceZkSyncEraBatchCostMv,
    createOrReplaceZkSyncEraBatchCreatedMv,
    createOrReplaceZkSyncEraBatchFinalityMv,
    createOrReplaceZkSyncEraAvgCostOfBatchesDateRange,
    createOrReplaceZkSyncEraBatchAvgDuration,
    createOrReplaceZkSyncEraNormalizationBatchedTxs,
  } = await import('./zk-sync-era')

  const createOrReplaceScrollMv = async () => {
    console.log('Creating materialized views for Scroll...')
    await createOrReplaceScrollBatchCostMV()
    await createOrReplaceScrollBatchFinalityMv()
    await createOrReplaceScrollBatchCreatedMv()
    await createOrReplaceScrollBatchAvgCostMV()
    await createOrReplaceScrollBatchAvgDuration()
    await createOrReplaceScrollAvgCostOfBatchesDateRange()
    await createOrReplaceScrollNormalizationBatchedTxs()
    console.log('Materialized views for Scroll created!')
  }

  const createOrReplacePolygonZkEvmMv = async () => {
    console.log("Creating materialized views for Polygon's ZK-EVM...")
    await createOrReplacePolygonZkEvmBatchCostMv()
    await createOrReplacePolygonZkEvmBatchFinalityMv()
    await createOrReplacePolygonZkEvmBatchCreatedMv()
    await createOrReplacePolygonZkEvmBatchAvgCostMv()
    await createOrReplacePolygonZkEvmBatchAvgDuration()
    await createOrReplacePolygonZkEvmAvgCostOfBatchesDateRange()
    await createOrReplacePolygonZkEvmNormalizationBatchedTxs()
    console.log("Materialized views for Polygon's ZK-EVM created!")
  }

  const createOrReplaceZkSyncEraMv = async () => {
    console.log('Creating materialized views for zkSync era...')
    await createOrReplaceZkSyncEraBatchCostMv()
    await createOrReplaceZkSyncEraBatchFinalityMv()
    await createOrReplaceZkSyncEraBatchCreatedMv()
    await createOrReplaceZkSyncEraBatchAvgCostMv()
    await createOrReplaceZkSyncEraBatchAvgDuration()
    await createOrReplaceZkSyncEraAvgCostOfBatchesDateRange()
    await createOrReplaceZkSyncEraNormalizationBatchedTxs()
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
