import { differenceInDays, differenceInSeconds } from 'date-fns'

import { logger } from '@zk-dashboard/common/lib/logger'

type Entity = {
  /**
   * Unix timestamp in seconds
   */
  timestamp: Date
  number: number | bigint
}

type GetEntityFunction<T extends Entity> = (entityNumber: number) => Promise<T>

type EntityApi<T extends Entity> = {
  getEntity: GetEntityFunction<T>
  /**
   * Number of entities between the starting entity and the entity we want to get.
   * It is used to calculate the approximate interval of how many entities are created per second.
   * Example: if the entityNumberSpan is 1_000, it will get entity with number `entityNumber - 1_000` and calculate the interval between the two entities.
   */
  entityNumberSpan: number
}

/**
 * Get approximate interval of how many entities (e.g. entity, block) are created per second
 */
const getApproximateEntitiesCreatedPerSecond = async <T extends Entity>(
  startingEntity: Entity,
  api: EntityApi<T>
) => {
  const entityNumberSpan = api.entityNumberSpan ?? 10_000
  const startingEntityTimestamp = startingEntity.timestamp
  const startingEntityNumber = Number(startingEntity.number)
  // get the entity (e.g batch) which was `entityNumberSpan` entities before the latest entity
  const prevEntity = await api.getEntity(
    startingEntityNumber - entityNumberSpan
  )

  const prevEntityTimestamp = prevEntity.timestamp

  return (
    entityNumberSpan /
    differenceInSeconds(startingEntityTimestamp, prevEntityTimestamp)
  )
}

const getApproximateEntitiesCreatedPerDay = async <T extends Entity>(
  startingEntity: Entity,
  api: EntityApi<T>
) => {
  const approximateBlocksPerSecond =
    await getApproximateEntitiesCreatedPerSecond(startingEntity, {
      getEntity: api.getEntity,
      entityNumberSpan: api.entityNumberSpan,
    })

  return Math.floor(approximateBlocksPerSecond * 60 * 60 * 24)
}

export async function searchOldestEntity<T extends Entity>({
  probablyOldestEntity,
  latestEntity,
  loggerTag,
  maxDataAgeInDays,
  getEntity,
  entityNumberSpan,
  entityName,
}: {
  probablyOldestEntity: T
  latestEntity: T
  loggerTag: Record<string, string>
  maxDataAgeInDays: number
  getEntity: GetEntityFunction<T>
  /**
   * Number of entities between the starting entity and the entity we want to get.
   * It is used to calculate the approximate interval of how many entities are created per second.
   * Example: if the entityNumberSpan is 1_000, it will get entity with number `entityNumber - 1_000` and calculate the interval between the two entities.
   */
  entityNumberSpan: number
  entityName: string
}): Promise<T> {
  const diffInDays = differenceInDays(
    latestEntity.timestamp,
    probablyOldestEntity.timestamp
  )

  logger.info(
    loggerTag,
    `diff in days: ${diffInDays} | latest ${entityName} number: ${latestEntity.number} | oldest ${entityName} number: ${probablyOldestEntity.number}...`
  )
  if (diffInDays === maxDataAgeInDays) {
    logger.info(
      loggerTag,
      `found the oldest ${entityName} with number: ${probablyOldestEntity.number} from date: ${probablyOldestEntity.timestamp}...`
    )
    return probablyOldestEntity
  }

  const diffFromMaxAge = maxDataAgeInDays - diffInDays

  const approximatedEntitiesPerDay = await getApproximateEntitiesCreatedPerDay(
    probablyOldestEntity,
    { getEntity, entityNumberSpan }
  )

  const entityNumberFromBefore =
    Number(probablyOldestEntity.number) -
    approximatedEntitiesPerDay * diffFromMaxAge

  const oldestEntity = await getEntity(entityNumberFromBefore)

  logger.info(
    loggerTag,
    `continue searching for the oldest ${entityName}, probably oldest ${entityName}: ${oldestEntity.number}...`
  )

  return searchOldestEntity<T>({
    probablyOldestEntity: oldestEntity,
    latestEntity,
    loggerTag,
    maxDataAgeInDays,
    getEntity,
    entityNumberSpan,
    entityName,
  })
}
