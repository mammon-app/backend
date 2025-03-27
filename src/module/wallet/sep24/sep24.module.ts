import { Module } from "@nestjs/common";
import { InternalCacheModule } from "../../../internal-cache/internal-cache.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/user.schema";
import { Sep24Service } from "./sep24.service";
import { Sep24Controller } from "./sep24.controller";
import { Sep1Service } from "../sep1/sep1.service";
import {
  DEV_RABBITMQ_NOTIFICATION,
  DEV_RABBITMQ_QUEUE_NAME,
  DEV_RABBITMQ_URL,
  NODE_ENV,
  PRODUCTION_RABBITMQ_NOTIFICATION,
  PRODUCTION_RABBITMQ_QUEUE_NAME,
  PRODUCTION_RABBITMQ_URL,
} from "src/config/env.config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Sep10Service } from "../sep10/sep10.service";
import {
  TransactionHistory,
  TransactionHistorySchema,
} from "src/schemas/transaction-history.schema";

/**
 * The Sep24Module is responsible for handling SEP-24 related operations.
 * It imports necessary modules, defines controllers and providers, and exports services as needed.
 */
@Module({
  imports: [
    // Import MongooseModule and define the User schema
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: TransactionHistory.name,
        schema: TransactionHistorySchema,
      },
    ]),
    // Import the internal cache module for caching purposes
    InternalCacheModule,
  ],
  // Define the controllers that will handle incoming requests
  controllers: [Sep24Controller],
  // Define the providers that will be used for dependency injection
  providers: [Sep24Service, Sep10Service, Sep1Service],
  // Export the Sep24Service to make it available for other modules
  exports: [Sep24Service],
})
export class Sep24Module {}
