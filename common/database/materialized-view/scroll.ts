import { serial } from 'drizzle-orm/pg-core'
import { createPgMaterializedView } from './utils'
import { sql } from 'drizzle-orm'

// Example of a materialized view.
export const {
  materializedView: scrollBatchesMaterializedView,
  createOrReplace: createOrReplaceScrollBatchesMV,
} = createPgMaterializedView(
  'scroll_batches_materialized_view',
  {
    id: serial('id').primaryKey(),
  },
  sql`
    SELECT
      id
    FROM
      scroll_batches
    LIMIT
      10
  `
)
