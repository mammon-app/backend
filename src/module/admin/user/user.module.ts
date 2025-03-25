import { Module } from "@nestjs/common";
import { AdminUserService } from "./user.service";
import { AdminUserController } from "./user.controller";
import { InternalCacheModule } from "../../../internal-cache/internal-cache.module";
import { User, UserSchema } from "src/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import {
  UserSetting,
  UserSettingSchema,
} from "src/schemas/user.setting.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserSetting.name,
        schema: UserSettingSchema,
      },
    ]),
    InternalCacheModule,
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
