import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { User, UserSchema } from "src/schemas/user.schema";
import { InternalCacheModule } from "src/internal-cache/internal-cache.module";
import { AuthService } from "./auth.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  DEV_RABBITMQ_NOTIFICATION,
  DEV_RABBITMQ_QUEUE_NAME,
  DEV_RABBITMQ_URL,
  PRODUCTION_RABBITMQ_NOTIFICATION,
  PRODUCTION_RABBITMQ_QUEUE_NAME,
  PRODUCTION_RABBITMQ_URL,
  NODE_ENV,
} from "src/config/env.config";
import { MFA, MFASchema } from "src/schemas/mfa.schema";
import { Referral, ReferralSchema } from "src/schemas/referral.schema";
import { Task, TaskSchema } from "src/schemas/task.schema";
import { UserTask, UserTaskSchema } from "src/schemas/user-task.schema";
import { AuthController } from "./auth.controller";
import {
  UserSetting,
  UserSettingSchema,
} from "src/schemas/user.setting.schema";
import { GoogleStrategy } from "src/common/helpers/google.auth.helper";

/**
 * AuthModule is responsible for setting up and configuring the authentication-related
 * components within the application. It imports necessary modules, registers Mongoose
 * schemas for database operations, configures microservices for asynchronous messaging,
 * and provides controllers and services for handling authentication logic.
 */
@Module({
  imports: [
    // Register Mongoose schemas for User, UserSetting, and MFA collections
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
        name: MFA.name,
        schema: MFASchema,
      },
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: UserTask.name,
        schema: UserTaskSchema,
      },
      {
        name: Referral.name,
        schema: ReferralSchema,
      },
    ]),
    // Register RabbitMQ client based on environment configuration for notifications
    ClientsModule.register([
      {
        name:
          NODE_ENV === "development"
            ? DEV_RABBITMQ_NOTIFICATION
            : PRODUCTION_RABBITMQ_NOTIFICATION,
        transport: Transport.RMQ,
        options: {
          urls: [
            NODE_ENV === "development"
              ? DEV_RABBITMQ_URL
              : PRODUCTION_RABBITMQ_URL,
          ],
          queue:
            NODE_ENV === "development"
              ? DEV_RABBITMQ_QUEUE_NAME
              : PRODUCTION_RABBITMQ_QUEUE_NAME,
          queueOptions: {
            durable: false, // Non-durable queue for notifications
          },
          noAck: false,
        },
      },
    ]),
    // Import internal cache module for caching functionalities
    InternalCacheModule,
  ],
  // Specify controllers to handle incoming HTTP requests
  controllers: [AuthController],
  // Provide AuthService for authentication logic and user operations
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
