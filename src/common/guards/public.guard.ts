import { SetMetadata } from '@nestjs/common';

/**
 * PublicGuard is a custom decorator to mark routes as public.
 *
 * This decorator sets a metadata key 'isPublic' to true on the route handler,
 * indicating that the route does not require authentication.
 *
 * Usage example:
 *
 * @PublicGuard()
 * @Get('public-route')
 * publicRoute() {
 *   return 'This route is public and does not require authentication';
 * }
 *
 * @returns {CustomDecorator<string>} - A custom decorator to be applied on route handlers.
 */
export const PublicGuard = () => SetMetadata('isPublic', true);
