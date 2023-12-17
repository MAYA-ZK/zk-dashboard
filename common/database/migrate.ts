import fs from 'fs'

import('dotenv').then(async ({ config }) => {
  if (fs.existsSync('./.env')) {
    config()
  } else {
    config({ path: '../.env' })
  }

  const { client, db } = await import('./utils')
  const { migrate } = await import('drizzle-orm/postgres-js/migrator')

  const runMigration = async () => {
    console.log('Running migration...')
    await migrate(db, {
      migrationsFolder: 'drizzle',
    })
    console.log('Migration complete!')

    console.log('Closing connection...')
    await client.end()
    console.log('Connection closed!')
  }

  runMigration()
})

export {}
