import { Inject } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UserService } from "src/module/user/user.service";
import { User } from "src/schemas/user.schema";

export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(UserService) private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user);
  }
  async deserializeUser(payload: any, done: Function) {
    const user = await this.userService.getUserProfile(payload);
    return user ? done(null, user) : done(null, null);
  }
}
