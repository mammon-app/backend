import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { InternalCacheModule } from "../../internal-cache/internal-cache.module";
import { User, UserSchema } from "src/schemas/user.schema";
import { Referral, ReferralSchema } from "src/schemas/referral.schema";
import { Task, TaskSchema } from "src/schemas/task.schema";
import { UserTask, UserTaskSchema } from "src/schemas/user-task.schema";
import { MongooseModule } from "@nestjs/mongoose";
import {
  UserSetting,
  UserSettingSchema,
} from "src/schemas/user.setting.schema";
import { SessionSerializer } from "src/common/helpers/serializer.helper";
import { FileUploadModule } from "../fileUpload/fileUpload.module";

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
      {
        name: Referral.name,
        schema: ReferralSchema,
      },
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: UserTask.name,
        schema: UserTaskSchema,
      },
    ]),
    InternalCacheModule,
    FileUploadModule,
  ],
  controllers: [UserController],
  providers: [UserService, SessionSerializer],
  exports: [UserService],
})
export class UserModule {}
