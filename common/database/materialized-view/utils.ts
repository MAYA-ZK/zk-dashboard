import type { SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type {
  PgColumnBuilderBase,
  PgMaterializedView,
} from 'drizzle-orm/pg-core'
import { pgMaterializedView } from 'drizzle-orm/pg-core'

import { logger } from '../../lib/logger'
import { db } from '../utils'

// Drizzle ORM or Drizzle Kit does not support materialized views migrations. This is a workaround to create or replace materialized views.

function createIfNotExistsMaterializedView(
  tableName: string,
  query: SQL<unknown>
) {
  return sql`
    DO $$
    BEGIN
    IF NOT EXISTS (
    	SELECT
    		1
    	FROM
    		pg_matviews
    	WHERE
    		matviewname = '${sql.raw(tableName)}') THEN
    	CREATE MATERIALIZED VIEW ${sql.raw(tableName)} AS
    	${query};
    END IF;
    END
    $$;
  `
}

function createOrReplaceMaterializedViewQuery(
  tableName: string,
  query: SQL<unknown>
) {
  return sql`
    DROP MATERIALIZED VIEW IF EXISTS ${sql.raw(tableName)} CASCADE;

    CREATE MATERIALIZED VIEW ${sql.raw(tableName)} AS ${query}
  `
}

export function createPgMaterializedView<
  TName extends string,
  TColumns extends Record<string, PgColumnBuilderBase>,
>(name: TName, columns: TColumns, query: SQL<unknown>) {
  const materializedView = pgMaterializedView(name, columns).as(query)

  const create = () =>
    db.execute(createIfNotExistsMaterializedView(name, query))
  const createOrReplace = () =>
    db.execute(createOrReplaceMaterializedViewQuery(name, query))

  return { materializedView, create, createOrReplace }
}

type CreateOrReplaceFunction<
  TName extends string,
  TColumns extends Record<string, PgColumnBuilderBase>,
> = ReturnType<
  typeof createPgMaterializedView<TName, TColumns>
>['createOrReplace']

export function getNameFromMaterializedView(view: PgMaterializedView) {
  // Type definition does not specify symbol key
  return (view as unknown as { [key: symbol]: { name?: string } })[
    Symbol.for('drizzle:ViewBaseConfig')
  ]?.name as string
}
export async function refreshMaterializedViews(
  views: Array<PgMaterializedView>
) {
  for (const view of views) {
    const viewName = getNameFromMaterializedView(view)
    logger.info(`Refreshing materialized view ${viewName}`)
    await db.refreshMaterializedView(view)
    logger.info(`Done refreshing materialized view ${viewName}`)
  }
}

export async function creatOrReplaceMaterializedViews<
  TName extends string,
  TColumns extends Record<string, PgColumnBuilderBase>,
>(createOrReplaceFunctions: Array<CreateOrReplaceFunction<TName, TColumns>>) {
  for (const createOrReplaceView of createOrReplaceFunctions) {
    await createOrReplaceView()
  }
}
