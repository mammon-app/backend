import { CacheModule, Module } from "@nestjs/common";
import { InternalCacheService } from "./internal-cache.service";
import * as redisStore from "cache-manager-redis-store";
import {
  DEV_REDIS_HOST,
  DEV_REDIS_PORT,
  NODE_ENV,
  PRODUCTION_REDIS_HOST,
  PRODUCTION_REDIS_PASSWORD,
  PRODUCTION_REDIS_PORT,
  // PRODUCTION_REDIS_URL,
} from "../config/env.config";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ClientOpts } from "redis";

// Configuration options for the Redis caching store
const redisOptions: ClientOpts = {
  host: DEV_REDIS_HOST, // Redis server hostname (development environment)
  port: DEV_REDIS_PORT, // Redis server port (development environment)
  ttl: 60 * 5, // Time-to-live (TTL) set to 5 minutes for cached data
};

/**
 * NestJS module for managing internal caching using Cache Manager with Redis as the caching store.
 * This module handles configuration and provides access to the InternalCacheService for caching operations.
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore, // Using Redis as the caching store
        ...(NODE_ENV === "development"
          ? redisOptions // Development environment settings
          : {
              host: PRODUCTION_REDIS_HOST, // Redis server hostname (production environment)
              port: PRODUCTION_REDIS_PORT, // Redis server port (production environment)
              ttl: 60 * 5, // Time-to-live (TTL) set to 5 minutes for cached data
            }), // Production environment settings
      }),
    }),
  ],
  providers: [InternalCacheService], // Injecting InternalCacheService for cache management
  exports: [InternalCacheService], // Exporting InternalCacheService for use in other modules
})
export class InternalCacheModule {}
