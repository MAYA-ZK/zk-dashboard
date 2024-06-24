/**
 * Maximum age of the data in days, we want to collect.
 */
export const MAX_DATA_AGE_IN_DAYS = 91
/**
 * Number of days after which the data is purged.
 */
export const PURGE_AFTER_DAYS = 95
/**
 * Maximum wait time for the request to complete.
 */
export const REQUEST_TIMEOUT = 1_000 * 60 // 1 minute

/**
 * ID of the monitoring logs. This is used to identify the logs in aws cloudwatch and send alerts.
 */
export const MONITORING_LOGS_ID = {
  SYNC_START: 'SYNC_START',
  SYNC_END: 'SYNC_END',
  MATERIALIZED_VIEW_REFRESH_START: 'MATERIALIZED_VIEW_REFRESH_START',
  MATERIALIZED_VIEW_REFRESH_END: 'MATERIALIZED_VIEW_REFRESH_END',
}
