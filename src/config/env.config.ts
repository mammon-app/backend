import * as env from 'env-var';
import { config } from 'dotenv';

// Load environment variables from the .env file
config();

// General Application Configuration

/**
 * Node environment (development, production, etc.).
 */
export const NODE_ENV = env.get('NODE_ENV').asString();

/**
 * Application port.
 */
export const PORT = env.get('PORT').required().asInt();

/**
 * JWT secret key for authentication.
 */
export const JWT_SECRET = env.get('JWT_SECRET').asString();

/**
 * JWT refresh token secret key.
 */
export const JWT_REFRESH_SECRET = env.get('JWT_REFRESH_SECRET').asString();

/**
 * API key for external services.
 */
export const API_KEY = env.get('API_KEY').asString();

/**
 * Encryption key for sensitive data.
 */
export const ENCRYPTION_KEY = env.get('ENCRYPTION_KEY').asString();

// Email Service Configuration

/**
 * Username for the email service.
 */
export const EMAIL_USERNAME = env.get('EMAIL_USERNAME').asString();

/**
 * Password for the email service.
 */
export const EMAIL_PASSWORD = env.get('EMAIL_PASSWORD').asString();

/**
 * Hostname of the email service.
 */
export const EMAIL_HOST = env.get('EMAIL_HOST').asString();

/**
 * Port number of the email service.
 */
export const EMAIL_PORT = env.get('EMAIL_PORT').asString();

// Database Configuration

/**
 * URL for connecting to the development database.
 */
export const DEV_DB_URL = env.get('DEV_DB_URL').asString();

/**
 * URL for connecting to the production database.
 */
export const PRODUCTION_DB_URL = env.get('PRODUCTION_DB_URL').asString();

/**
 * URL for connecting to the staging database.
 */
export const STAGING_DB_URL = env.get('STAGING_DB_URL').asString();

// Microservices Configuration

// Redis Configuration for Development Environment
/**
 * Hostname or IP address of the Redis server in the development environment.
 */
export const DEV_REDIS_HOST = env.get('DEV_REDIS_HOST').asString();

/**
 * Port number of the Redis server in the development environment.
 */
export const DEV_REDIS_PORT = env.get('DEV_REDIS_PORT').asInt();

/**
 * Password for connecting to the Redis server in the development environment.
 */
export const DEV_REDIS_PASSWORD = env.get('DEV_REDIS_PASSWORD').asString();

/**
 * URL for connecting to the Redis server in the development environment.
 */
export const DEV_REDIS_URL = env.get('DEV_REDIS_URL').asString();

// Redis Configuration Constants for Production Environment
/**
 * Hostname or IP address of the Redis server in the production environment.
 */
export const PRODUCTION_REDIS_HOST = env
  .get('PRODUCTION_REDIS_HOST')
  .asString();

/**
 * Port number of the Redis server in the production environment.
 */
export const PRODUCTION_REDIS_PORT = env.get('PRODUCTION_REDIS_PORT').asInt();

/**
 * Password for connecting to the Redis server in the production environment.
 */
export const PRODUCTION_REDIS_PASSWORD = env
  .get('PRODUCTION_REDIS_PASSWORD')
  .asString();

/**
 * URL for connecting to the Redis server in the production environment.
 */
export const PRODUCTION_REDIS_URL = env.get('PRODUCTION_REDIS_URL').asString();

// RabbitMQ Configuration Constants for Development Environment
/**
 * URL for connecting to the RabbitMQ server in the development environment.
 */
export const DEV_RABBITMQ_URL = env.get('DEV_RABBITMQ_URL').asString();

/**
 * Name of the RabbitMQ queue in the development environment.
 */
export const DEV_RABBITMQ_QUEUE_NAME = env
  .get('DEV_RABBITMQ_QUEUE_NAME')
  .asString();

/**
 * Name of the RabbitMQ notification queue in the development environment.
 */
export const DEV_RABBITMQ_NOTIFICATION = env
  .get('DEV_RABBITMQ_NOTIFICATION')
  .asString();

// RabbitMQ Configuration Constants for Production Environment
/**
 * URL for connecting to the RabbitMQ server in the production environment.
 */
export const PRODUCTION_RABBITMQ_URL = env
  .get('PRODUCTION_RABBITMQ_URL')
  .asString();

/**
 * Name of the RabbitMQ queue in the production environment.
 */
export const PRODUCTION_RABBITMQ_QUEUE_NAME = env
  .get('PRODUCTION_RABBITMQ_QUEUE_NAME')
  .asString();

/**
 * Name of the RabbitMQ notification queue in the production environment.
 */
export const PRODUCTION_RABBITMQ_NOTIFICATION = env
  .get('PRODUCTION_RABBITMQ_NOTIFICATION')
  .asString();

// Swagger Documentation Configuration Constants
/**
 * Root URL for Swagger API documentation.
 */
export const SWAGGER_API_ROOT = env.get('SWAGGER_API_ROOT').asString();

/**
 * Name of the Swagger API.
 */
export const SWAGGER_API_NAME = env.get('SWAGGER_API_NAME').asString();

/**
 * Description of the Swagger API.
 */
export const SWAGGER_API_DESCRIPTION = env
  .get('SWAGGER_API_DESCRIPTION')
  .asString();

/**
 * Current version of the Swagger API.
 */
export const SWAGGER_API_CURRENT_VERSION = env
  .get('SWAGGER_API_CURRENT_VERSION')
  .asString();

// Stellar Configuration Constants
/**
 * URL for the Stellar Horizon testnet environment.
 */
export const HORIZON_TESTNET_URL = env.get('HORIZON_TESTNET_URL').asString();

/**
 * URL for the Stellar Horizon mainnet environment.
 */
export const HORIZON_MAINNET_URL = env.get('HORIZON_MAINNET_URL').asString();

/**
 * Secret key for funding Stellar accounts.
 */
export const FUNDING_KEY_SECRET = env.get('FUNDING_KEY_SECRET').asString();

/**
 * Public key for funding Stellar accounts.
 */
export const FUNDING_KEY_PUBLIC = env.get('FUNDING_KEY_PUBLIC').asString();

/**
 * Secret key for Stellar operations.
 */
export const CLINET_STELLAR_SECRET_KEY = env
  .get('CLINET_STELLAR_SECRET_KEY')
  .asString();

/**
 * Public key for Stellar operations.
 */
export const STELLAR_PUBLIC_KEY = env.get('STELLAR_PUBLIC_KEY').asString();

/**
 * URL for the Stellar Federation server.
 */
export const FEDERATION_SERVER = env.get('FEDERATION_SERVER').asString();

/**
 * URL for the Stellar Auth server.
 */
export const AUTH_SERVER = env.get('AUTH_SERVER').asString();

/**
 * URL for the Stellar Transfer server.
 */
export const TRANSFER_SERVER = env.get('TRANSFER_SERVER').asString();

/**
 * URL for the Stellar KYC (Know Your Customer) server.
 */
export const KYC_SERVER = env.get('KYC_SERVER').asString();
export const CLIENT_STELLAR_PUBLIC_KEY = env
  .get('CLIENT_STELLAR_PUBLIC_KEY')
  .asString();
export const STELLAR_PUBLIC_SERVER = env
  .get('STELLAR_PUBLIC_SERVER')
  .asString();
export const STELLAR_TESTNET_SERVER = env
  .get('STELLAR_TESTNET_SERVER')
  .asString();
export const TIMEOUT = env.get('TIMEOUT').asString();
export const FEE = env.get('FEE').asString();
export const STELLAR_NETWORK = env.get('STELLAR_NETWORK').asString();
export const HOME_DOMAIN = env.get('HOME_DOMAIN').asString();
export const HOME_DOMAIN_SHORT = env.get('HOME_DOMAIN_SHORT').asString();
export const TWITTER_BEARER_TOKEN = env.get('TWITTER_BEARER_TOKEN').asString();
export const TWITTER_HANDLE = env.get('TWITTER_HANDLE').asString();
export const GOOGLE_CLIENT_ID = env.get('GOOGLE_CLIENT_ID').asString();
export const GOOGLE_SECRET_KEY = env.get('GOOGLE_SECRET_KEY').asString();
export const GOOGLE_CALL_BACK_URI = env.get('GOOGLE_CALL_BACK_URI').asString();
export const SECRET = env.get('SECRET').asString();

export const CLOUDINARY_CLOUD_NAME = env
  .get('CLOUDINARY_CLOUD_NAME')
  .asString();
export const CLOUDINARY_API_KEY = env.get('CLOUDINARY_API_KEY').asString();
export const CLOUDINARY_API_SECRET = env
  .get('CLOUDINARY_API_SECRET')
  .asString();
export const CMC_PRO_API_KEY = env
  .get('CMC_PRO_API_KEY')
  .asString();
export const APP_NAME = env
  .get('APP_NAME')
  .asString();
export const CLIENT_URL = env
  .get('CLIENT_URL')
  .asString();
export const TELEGRAM_COMMUNITY_URL = env
  .get('TELEGRAM_COMMUNITY_URL')
  .asString();
export const X_URL = env
  .get('X_URL')
  .asString();
export const RECAPTCHA_SECRET_KEY = env
  .get('RECAPTCHA_SECRET_KEY')
  .asString();
export const RECAPTCHA_BASE = env
  .get('RECAPTCHA_BASE')
  .asString();
