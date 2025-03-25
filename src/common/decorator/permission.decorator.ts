import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to set permissions metadata on a route handler.
 *
 * This decorator can be used to specify required permissions for accessing a route.
 * The permissions are passed as arguments to the decorator and stored in the
 * metadata of the route handler. This metadata can later be accessed by guards
 * to enforce the permissions.
 *
 * @param {string[]} permissions - The permissions required to access the route.
 * @returns {CustomDecorator<string>} - The metadata decorator.
 */
export const hasPermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
