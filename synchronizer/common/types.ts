import type {
  lineaBlocks,
  polygonZkEvmBlocks,
  scrollBlocks,
  zkSyncEraBlocks,
} from '@zk-dashboard/common/database/schema'
import type {
  polygonZkEvmBatches,
  scrollBatches,
  zkSyncEraBatches,
} from '@zk-dashboard/common/database/schema'
import type { lineaRpc } from '@zk-dashboard/common/integrations/linea/rpc'
import type { polygonZkEvmRpc } from '@zk-dashboard/common/integrations/polygon-zk-evm/rpc'
import type { scrollRpc } from '@zk-dashboard/common/integrations/scroll/rpc'
import type { zkSyncEraRpc } from '@zk-dashboard/common/integrations/zk-sync-era/rpc'

export type LoggerTag = Record<string, string>

export type BlocksTable =
  | typeof polygonZkEvmBlocks
  | typeof scrollBlocks
  | typeof zkSyncEraBlocks
  | typeof lineaBlocks

export type BlocksApi =
  | typeof polygonZkEvmRpc
  | typeof scrollRpc
  | typeof zkSyncEraRpc
  | typeof lineaRpc

export type GetBlockReturnType = Awaited<ReturnType<BlocksApi['getBlock']>>

export type BatchesTable =
  | typeof polygonZkEvmBatches
  | typeof zkSyncEraBatches
  | typeof scrollBatches

export type BatchesApi =
  | typeof polygonZkEvmRpc
  | typeof zkSyncEraRpc
  | typeof scrollRpc

export type GetBatchReturnTYpe = Awaited<ReturnType<BatchesApi['getBatch']>>
