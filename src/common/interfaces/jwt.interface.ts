/**
 * Interface representing the payload structure of a JSON Web Token (JWT).
 */
export interface JwtPayload {
  /**
   * Unique identifier, such as a user's ID.
   */
  id: string;

  /**
   * Expiration time of the token (Unix timestamp).
   * This is optional and depends on your JWT configuration.
   */
  exp?: number;

  /**
   * Subject of the token.
   * This can be a user ID or any other subject identifier.
   * It is optional and depends on your JWT usage.
   */
  sub?: string;

  /**
   * Issued at time of the token (Unix timestamp).
   * This is optional and depends on your JWT configuration.
   */
  iat?: number;
}
