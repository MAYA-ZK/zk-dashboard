import type { SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type { PgColumnBuilderBase } from 'drizzle-orm/pg-core'
import { pgMaterializedView } from 'drizzle-orm/pg-core'

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
