import { Module } from "@nestjs/common";
import { OwnerUserService } from "./user.service";
import { OwnerUserController } from "./user.controller";
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
  controllers: [OwnerUserController],
  providers: [OwnerUserService],
  exports: [OwnerUserService],
})
export class OwnerUserModule {}
