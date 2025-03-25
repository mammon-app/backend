import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { User, UserSchema } from 'src/schemas/user.schema';
import { InternalCacheModule } from 'src/internal-cache/internal-cache.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  DEV_RABBITMQ_NOTIFICATION,
  DEV_RABBITMQ_QUEUE_NAME,
  DEV_RABBITMQ_URL,
  PRODUCTION_RABBITMQ_NOTIFICATION,
  PRODUCTION_RABBITMQ_QUEUE_NAME,
  PRODUCTION_RABBITMQ_URL,
  NODE_ENV,
} from 'src/config/env.config';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

/**
 * TransactionsModule is responsible for setting up and configuring the transaction-related
 * components within the application. It imports necessary modules, registers Mongoose
 * schemas for database operations, configures microservices for asynchronous messaging,
 * and provides controllers and services for handling transaction logic.
 */
@Module({
  imports: [
    // Register Mongoose schema for User collection
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    // Register RabbitMQ client based on environment configuration for notifications
    ClientsModule.register([
      {
        name:
          NODE_ENV === 'development'
            ? DEV_RABBITMQ_NOTIFICATION
            : PRODUCTION_RABBITMQ_NOTIFICATION,
        transport: Transport.RMQ,
        options: {
          urls: [
            NODE_ENV === 'development'
              ? DEV_RABBITMQ_URL
              : PRODUCTION_RABBITMQ_URL,
          ],
          queue:
            NODE_ENV === 'development'
              ? DEV_RABBITMQ_QUEUE_NAME
              : PRODUCTION_RABBITMQ_QUEUE_NAME,
          queueOptions: {
            durable: false, // Non-durable queue for notifications
          },
          noAck: false, // Acknowledge message reception
        },
      },
    ]),
    // Import internal cache module for caching functionalities
    InternalCacheModule,
  ],
  // Specify controllers to handle incoming HTTP requests
  controllers: [TransactionsController],
  // Provide TransactionsService for handling transaction logic and user operations
  providers: [TransactionsService],
})
export class TransactionsModule {}
