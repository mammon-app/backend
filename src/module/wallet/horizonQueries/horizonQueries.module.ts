import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { User, UserSchema } from "src/schemas/user.schema";
import { InternalCacheModule } from "src/internal-cache/internal-cache.module";
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
import { HorizonQueriesService } from "./horizonQueries.service";
import { HorizonQueriesController } from "./horizonQueries.controller";
import {
  TransactionHistory,
  TransactionHistorySchema,
} from "src/schemas/transaction-history.schema";

/**
 * HorizonQueriesModule is responsible for setting up and configuring the Horizon queries
 * components within the application. It imports necessary modules, registers Mongoose
 * schemas for database operations, configures microservices for asynchronous messaging
 * using RabbitMQ, and provides controllers and services for handling Horizon-related logic.
 */
@Module({
  imports: [
    // Register Mongoose schemas for User collection
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
  controllers: [HorizonQueriesController],
  // Provide HorizonQueriesService for Horizon-related logic and operations
  providers: [HorizonQueriesService],
})
export class HorizonQueriesModule {}
