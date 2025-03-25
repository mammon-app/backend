import {
  DEV_DB_URL,
  PRODUCTION_DB_URL,
  STAGING_DB_URL,
  NODE_ENV,
} from 'src/config/env.config';

/**
 * Configure MongoDB connection URL based on the current environment.
 *
 * The configuration selects the appropriate database URL depending on whether
 * the application is running in production, staging, or development mode.
 * - In 'production' mode, it uses the `PRODUCTION_DB_URL`.
 * - In 'staging' mode, it uses the `STAGING_DB_URL`.
 * - In 'development' mode, it uses the `DEV_DB_URL`.
 *
 * @returns {string} MongoDB connection URL for the current environment.
 */
export const mongooseConfig =
  NODE_ENV === 'production'
    ? PRODUCTION_DB_URL
    : NODE_ENV === 'staging'
      ? STAGING_DB_URL
      : NODE_ENV === 'development' && DEV_DB_URL;
