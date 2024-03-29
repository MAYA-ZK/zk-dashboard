import { pgEnum } from 'drizzle-orm/pg-core'

import type { Period } from '../../lib/period'

export const period = pgEnum('period', [
  '1_day',
  '7_days',
  '30_days',
  '90_days',
] as const satisfies Array<Period>)
