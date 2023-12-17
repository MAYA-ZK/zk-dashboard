import * as dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'

dotenv.config({
  path: '../.env',
})

export default {
  schema: './database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config
