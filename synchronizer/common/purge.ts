import type { Column } from 'drizzle-orm'
import { lte, sql } from 'drizzle-orm'

import { db } from '@zk-dashboard/common/database/utils'
import { logger } from '@zk-dashboard/common/lib/logger'

import type { BatchesTable, BlocksTable, LoggerTag } from './types'

export function createDataPurge<TTable extends BlocksTable | BatchesTable>({
  table,
  tableColumnKey,
  tableName,
  loggerTag,
}: {
  table: TTable
  tableColumnKey: keyof TTable['_']['columns']
  tableName: TTable['_']['name']
  loggerTag: LoggerTag
}) {
  return async (olderThanDays: number) => {
    logger.info(
      loggerTag,
      `Purging data in ${tableName} older than ${olderThanDays} days`
    )

    const tableColumn = table[tableColumnKey] as Column

    await db
      .delete(table)
      .where(
        lte(
          tableColumn,
          sql`CURRENT_DATE - INTERVAL '${sql.raw(olderThanDays.toString())} days'`
        )
      )

    logger.info(loggerTag, `Done purging ${tableName}`)
  }
}
