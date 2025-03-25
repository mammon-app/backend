import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env.config';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.get('Authorization');

    if (!authorizationHeader)
      throw new UnauthorizedException(
        'Unauthorized request: No Authorization header',
      );

    const tokenParts = authorizationHeader.split(' ');

    if (
      tokenParts.length !== 2 ||
      !['Bearer', 'bearer'].includes(tokenParts[0])
    )
      throw new UnauthorizedException(
        'Unauthorized request: Invalid Authorization header format',
      );

    let decodedToken: any;
    try {
      decodedToken = verify(tokenParts[1], JWT_SECRET);
    } catch (e) {
      throw new UnauthorizedException('Unauthorized request: Invalid token');
    }

    if (!decodedToken || !decodedToken.id)
      throw new UnauthorizedException(
        'Unauthorized request: Invalid token contents',
      );

    try {
      // Check token expiration here if needed
      const user = await this.userModel.findById(decodedToken.id).lean();
      if (!user)
        throw new UnauthorizedException('Unauthorized request: User not found');
      if (!user.isEmailVerified)
        throw new UnauthorizedException(
          'Please verify your email to enjoy full access',
        );

      request.user = user;
      return true;
    } catch (e) {
      console.error('Error during token validation:', e);
      if (
        e.response.message === 'Please veriify your email to enjoy full access'
      )
        throw new UnauthorizedException(
          'Please veriify your email to enjoy full access',
        );
      throw new UnauthorizedException(
        'Unauthorized request: Something went wrong',
      );
    }
  }
}
