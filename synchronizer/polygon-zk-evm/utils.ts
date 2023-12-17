import { differenceInDays, differenceInSeconds } from 'date-fns'

import { logger } from '@zk-dashboard/common/lib/logger'

type Timestamp = string | number | bigint | Date

type Entity = {
  /**
   * Unix timestamp in seconds
   */
  timestamp: Timestamp
  number: number | bigint
}

type GetEntityFunction<T extends Entity> = (entityNumber: number) => Promise<T>

type EntityApi<T extends Entity> = {
  getEntity: GetEntityFunction<T>
  /**
   * Number of entities between the starting entity and the entity we want to get
   */
  entityNumberSpan: number
}

/**
 * Get approximate interval of how many entities (e.g. entity, block) are created per second
 */
const getApproximateEntitiesCreatedPerSecond = async <T extends Entity>(
  startingEntity: Entity,
  api: EntityApi<T>,
  timestampFormatter: (timestamp: Timestamp) => Date
) => {
  const entityNumberSpan = api.entityNumberSpan ?? 10_000
  const startingEntityTimestamp = timestampFormatter(startingEntity.timestamp)
  const startingEntityNumber = Number(startingEntity.number)
  // get the entity (e.g batch) which was `entityNumberSpan` entities before the latest entity
  const prevEntity = await api.getEntity(
    startingEntityNumber - entityNumberSpan
  )

  const prevEntityTimestamp = timestampFormatter(prevEntity.timestamp)

  return (
    entityNumberSpan /
    differenceInSeconds(startingEntityTimestamp, prevEntityTimestamp)
  )
}

const getApproximateEntitiesCreatedPerDay = async <T extends Entity>(
  startingEntity: Entity,
  api: EntityApi<T>,
  timestampFormatter: (timestamp: Timestamp) => Date
) => {
  const approximateBlocksPerSecond =
    await getApproximateEntitiesCreatedPerSecond(
      startingEntity,
      {
        getEntity: api.getEntity,
        entityNumberSpan: api.entityNumberSpan,
      },
      timestampFormatter
    )

  return Math.floor(approximateBlocksPerSecond * 60 * 60 * 24)
}

export const searchOldestEntity = async <T extends Entity>({
  probablyOldestEntity,
  latestEntity,
  loggerTag,
  maxDataAgeInDays,
  api,
  entityName,
  timestampFormatter = (timestamp) => timestamp as Date,
}: {
  probablyOldestEntity: T
  latestEntity: T
  loggerTag: Record<string, string>
  maxDataAgeInDays: number
  api: EntityApi<T>
  entityName: string
  timestampFormatter?: <TTimestamp = Date>(timestamp: TTimestamp) => Date
}): Promise<T> => {
  const diffInDays = differenceInDays(
    timestampFormatter(latestEntity.timestamp),
    timestampFormatter(probablyOldestEntity.timestamp)
  )

  logger.info(
    loggerTag,
    `diff in days: ${diffInDays} | latest ${entityName} number: ${latestEntity.number} | oldest ${entityName} number: ${probablyOldestEntity.number}...`
  )
  if (diffInDays === maxDataAgeInDays) {
    logger.info(
      loggerTag,
      `found the oldest ${entityName} with number: ${probablyOldestEntity.number} from date: ${timestampFormatter(probablyOldestEntity.timestamp)}...`
    )
    return probablyOldestEntity
  }

  const diffFromMaxAge = maxDataAgeInDays - diffInDays

  const approximatedEntitiesPerDay = await getApproximateEntitiesCreatedPerDay(
    probablyOldestEntity,
    api,
    timestampFormatter
  )

  const entityNumberFromBefore =
    Number(probablyOldestEntity.number) -
    approximatedEntitiesPerDay * diffFromMaxAge

  const oldestEntity = await api.getEntity(entityNumberFromBefore)

  logger.info(
    loggerTag,
    `continue searching for the oldest ${entityName}, probably oldest ${entityName}: ${oldestEntity.number}...`
  )

  return searchOldestEntity<T>({
    timestampFormatter,
    probablyOldestEntity: oldestEntity,
    latestEntity,
    loggerTag,
    maxDataAgeInDays,
    api,
    entityName,
  })
}
