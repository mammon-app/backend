import { Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET_KEY,
  GOOGLE_CALL_BACK_URI,
} from "src/config/env.config";
import { AuthService } from "src/module/auth/auth.service";

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super({
      clientID: `${GOOGLE_CLIENT_ID}`,
      clientSecret: `${GOOGLE_SECRET_KEY}`,
      callbackURL: `${GOOGLE_CALL_BACK_URI}`,
      scope: ["profile", "email"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateUser({
      email: profile._json.email,
      username: profile._json.given_name,
      userProfileUrl: profile._json.picture,
      isEmailVerified: profile._json.email_verified,
    });

    return user || null;
  }
}
