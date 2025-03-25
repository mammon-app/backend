/**
 * Service responsible for managing internal caching using Cache Manager within a NestJS application.
 * This service offers essential methods for retrieving, storing, and deleting cached data.
 */
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class InternalCacheService {
  /**
   * Constructs an instance of InternalCacheService with an injected Cache Manager instance.
   * @param cache The Cache Manager instance for handling caching operations.
   */
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /**
   * Retrieves cached data from the specified key in the cache.
   * @param key The key associated with the cached data.
   * @returns A Promise resolving to the cached data of type T if found, otherwise undefined.
   */
  async get<T>(key: string) {
    return await this.cache.get<T>(key);
  }

  /**
   * Stores data in the cache under the specified key with optional caching options.
   * @param key The key under which to cache the data.
   * @param value The data to be cached.
   * @param option Optional caching settings such as expiration time.
   */
  async set<T>(key: string, value: T, option?: number) {
    await this.cache.set(key, value, option);
  }

  /**
   * Deletes cached data associated with the specified key from the cache.
   * @param key The key of the data to be removed from the cache.
   */
  async delete(key: string) {
    await this.cache.del(key);
  }
}
