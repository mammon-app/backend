import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { verify, TokenExpiredError } from "jsonwebtoken";
import { JWT_REFRESH_SECRET } from "../../config/env.config";
import { User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

/**
 * RefreshGuard is a custom guard to protect routes by verifying JWT refresh tokens.
 *
 * This guard extracts the JWT refresh token from the Authorization header, verifies it,
 * and checks if the token is valid. It loads the associated user from the database
 * and attaches it to the request object.
 */
@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  /**
   * Determines if the current request can proceed based on the validity of the JWT refresh token.
   *
   * @param {ExecutionContext} context - The execution context of the current request.
   * @returns {Promise<boolean>} - True if the request is authorized, otherwise false.
   * @throws {UnauthorizedException} - If the token is missing, invalid, or the user is not found.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.get("Authorization");

    // Check if the Authorization header is present
    if (!authorizationHeader) {
      throw new UnauthorizedException(
        "Unauthorized request: No Authorization header"
      );
    }

    const tokenParts = authorizationHeader.split(" ");

    // Validate the format of the Authorization header
    if (
      tokenParts.length !== 2 ||
      !["Bearer", "bearer"].includes(tokenParts[0])
    ) {
      throw new UnauthorizedException(
        "Unauthorized request: Invalid Authorization header format"
      );
    }

    let decodedToken: any;
    try {
      decodedToken = verify(tokenParts[1], JWT_REFRESH_SECRET);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          "Unauthorized request: Login has expired"
        );
      }
      throw new UnauthorizedException("Unauthorized request: Invalid token");
    }

    // Check if the token contains the necessary user ID
    if (!decodedToken || !decodedToken.id) {
      throw new UnauthorizedException(
        "Unauthorized request: Invalid token contents"
      );
    }

    try {
      // Fetch the user associated with the token from the database
      const user = await this.userModel.findById(decodedToken.id).lean();
      if (!user) {
        throw new UnauthorizedException("Unauthorized request: User not found");
      }

      // Attach the user to the request object
      request.user = user;
      return true;
    } catch (e) {
      console.error("Error during token validation:", e);
      throw new UnauthorizedException(
        "Unauthorized request: Something went wrong"
      );
    }
  }
}
