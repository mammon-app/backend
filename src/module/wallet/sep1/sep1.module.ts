import { Module } from "@nestjs/common";
import { InternalCacheModule } from "../../../internal-cache/internal-cache.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/user.schema";
import { Sep1Service } from "./sep1.service";
import { Sep1Controller } from "./sep1.controller";
import {
  TransactionHistory,
  TransactionHistorySchema,
} from "src/schemas/transaction-history.schema";

/**
 * Module responsible for SEP-1 related functionality in the application.
 * Uses Mongoose for database integration and InternalCacheModule for internal caching needs.
 */
@Module({
  imports: [
    // Importing MongooseModule to integrate with MongoDB and define User schema
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
    // Importing InternalCacheModule for handling internal caching requirements
    InternalCacheModule,
  ],
  controllers: [Sep1Controller], // Controllers handling HTTP requests related to SEP-1
  providers: [Sep1Service], // Services providing business logic for SEP-1 operations
  exports: [Sep1Service], // Exporting SEP1Service to be used in other modules if required
})
export class Sep1Module {}
