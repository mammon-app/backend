import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Custom decorator to extract the user object from the request.
 *
 * This decorator can be used to easily access the user object attached to the
 * request in a route handler. It throws an UnauthorizedException if the user
 * object is not present, indicating that the request is unauthorized.
 *
 * @param {unknown} data - Optional data to be passed to the decorator (unused here).
 * @param {ExecutionContext} ctx - Execution context that provides access to the request.
 * @returns {any} - The user object from the request.
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Extract the request object from the execution context
    const request = ctx.switchToHttp().getRequest();

    // Check if the user object is present in the request
    if (!request.user) {
      // Throw an UnauthorizedException if the user object is missing
      throw new UnauthorizedException('Unauthorized request');
    }

    // Return the user object from the request
    return request.user;
  },
);
