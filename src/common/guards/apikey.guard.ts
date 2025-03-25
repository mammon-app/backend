import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

/**
 * ApiKeyGuard is a custom guard to protect routes using an API key.
 *
 * This guard checks for the presence of an API key in the request headers and
 * validates it against a predefined key stored in the configuration. It also
 * supports marking routes as public, bypassing the API key check.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  /**
   * Determines if the current request can proceed based on the presence and
   * validity of an API key.
   *
   * @param {ExecutionContext} context - The execution context of the current request.
   * @returns {boolean} - True if the request is authorized, otherwise false.
   * @throws {UnauthorizedException} - If the API key is missing or invalid.
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public and bypass API key validation if true
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    // Extract the request object from the execution context
    const request = context.switchToHttp().getRequest();
    // Get the API key from the request headers
    const apiKey = request.headers['api-key'];

    // If the API key is missing, throw an UnauthorizedException
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // If the API key is present but invalid, throw an UnauthorizedException
    if (apiKey && apiKey !== this.configService.get<string>('apiKey')) {
      throw new UnauthorizedException('Invalid API key');
    }

    // If the API key is valid, allow the request to proceed
    return true;
  }
}
