import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

function createClient() {
  const url = process.env.POSTGRES_URL
    ? process.env.POSTGRES_URL
    : 'postgres://postgres:postgres@localhost:5432/postgres'

  return postgres(url, {
    // TODO: figure out how to use drizzle with SSL and aws rds
    // ssl: Boolean(process.env.POSTGRES_URL),
  })
}

export const client = createClient()
export const db = drizzle(client, { schema })
