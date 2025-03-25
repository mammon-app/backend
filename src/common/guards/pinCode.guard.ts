import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { verify, TokenExpiredError } from 'jsonwebtoken';
  import { JWT_SECRET } from '../../config/env.config';
  import { User } from 'src/schemas/user.schema';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  

  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}
  
 
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const authorizationHeader = request.get('Authorization');
  
      // Check if the Authorization header is present
      if (!authorizationHeader) {
        throw new UnauthorizedException(
          'Unauthorized request: No Authorization header',
        );
      }
  
      const tokenParts = authorizationHeader.split(' ');
  
      // Validate the format of the Authorization header
      if (
        tokenParts.length !== 2 ||
        !['Bearer', 'bearer'].includes(tokenParts[0])
      ) {
        throw new UnauthorizedException(
          'Unauthorized request: Invalid Authorization header format',
        );
      }
  
      let decodedToken;
      try {
        // Verify the JWT token and decode it
        decodedToken = verify(tokenParts[1], JWT_SECRET);
      } catch (e) {
        // Handle token expiration and other verification errors
        if (e instanceof TokenExpiredError) {
          throw new UnauthorizedException(
            'Unauthorized request: Login has expired',
          );
        }
        throw new UnauthorizedException('Unauthorized request: Invalid token');
      }
  
      // Check if the token contains the necessary user ID
      if (!decodedToken || !decodedToken.id) {
        throw new UnauthorizedException(
          'Unauthorized request: Invalid token contents',
        );
      }
  
      try {
        // Fetch the user associated with the token from the database
        const user = await this.userModel.findById(decodedToken.id).lean();
        if (!user) {
          throw new UnauthorizedException('Unauthorized request: User not found');
        }
  
        // Attach the user to the request object
        request.user = user;
        return true;
      } catch (e) {
        console.error('Error during token validation:', e);
        throw new UnauthorizedException(
          'Unauthorized request: Something went wrong',
        );
      }
    }
  }
  