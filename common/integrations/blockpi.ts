import pThrottle from 'p-throttle'

// https://docs.blockpi.io/documentations/pricing-and-rate-limit
export const blockPiThrottle = pThrottle({
  limit: 10,
  interval: 650,
})

export const BLOCK_PI_API_URL = {
  SCROLL:
    'https://scroll.blockpi.network/v1/rpc/' +
    process.env.BLOCK_PI_SCROLL_API_KEY,
  ETHEREUM:
    'https://ethereum.blockpi.network/v1/rpc/' +
    process.env.BLOCK_PI_ETHEREUM_API_KEY,
  ZK_SYNC_ERA:
    'https://zksync-era.blockpi.network/v1/rpc/' +
    process.env.BLOCK_PI_ZK_SYNC_ERA_API_KEY,
  POLYGON_ZK_EVM:
    'https://polygon-zkevm.blockpi.network/v1/rpc/' +
    process.env.BLOCK_PI_POLYGON_ZK_EVM_API_KEY,
}
