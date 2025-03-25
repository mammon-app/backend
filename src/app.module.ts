import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { API_KEY } from "./config/env.config";
import { mongooseConfig } from "./config/mongoose.config";
import { ApiKeyGuard } from "./common/guards/apikey.guard";
import { AuthModule } from "./module/auth/auth.module";
import { MessageEventsModule } from "./common/events/user/message/events.module";
import { TransactionsModule } from "./module/wallet/transactions/transactions.module";
import { HorizonQueriesModule } from "./module/wallet/horizonQueries/horizonQueries.module";
import { Sep1Module } from "./module/wallet/sep1/sep1.module";
import { Sep10Module } from "./module/wallet/sep10/sep10.module";
import { Sep24Module } from "./module/wallet/sep24/sep24.module";
import { UserModule } from "./module/user/user.module";
import { MFAModule } from "./module/mfa/mfa.module";
import { AdminTierModule } from "./module/admin/referralProgram/tier/tier.module";
import { AdminTaskModule } from "./module/admin/referralProgram/task/task.module";
import { TaskModule } from "./module/referralProgram/task/task.module";
import { TierModule } from "./module/referralProgram/tier/tier.module";
import { AdminTransactionMessageEventsModule } from "./common/events/admin/message/transaction/events.module";
import { TransactionMessageEventsModule } from "./common/events/user/message/transaction/events.module";
import { AdminUserModule } from "./module/admin/user/user.module";
import { OwnerUserModule } from "./module/owner/user/user.module";

/**
 * The AppModule is the root module of the NestJS application.
 * It orchestrates the configuration of the application, including
 * importing necessary modules, setting up global guards, and
 * initializing services.
 */
@Module({
  imports: [
    // Configure the application's environment variables and load the API_KEY
    ConfigModule.forRoot({
      load: [() => ({ apiKey: API_KEY })],
    }),
    // Enable scheduling functionality for the application
    ScheduleModule.forRoot(),
    // Connect to MongoDB using Mongoose with custom configuration
    MongooseModule.forRoot(mongooseConfig),
    // Import the AuthModule for authentication-related features
    AuthModule,
    UserModule,
    // Import the TransactionsModule for handling wallet transactions
    TransactionsModule,
    // Import the HorizonQueriesModule for interacting with Stellar network
    HorizonQueriesModule,
    // Import the MessageEventsModule for handling user message events
    MessageEventsModule,
    // Import the AdminTransactionMessageEventsModule for handling transaction notification to admin message events
    AdminTransactionMessageEventsModule,
    // Import the TransactionMessageEventsModule for handling transaction notification to user message events
    TransactionMessageEventsModule,
    // Import the MFAModule for handling user multi-factor authentication
    MFAModule,
    Sep1Module,
    Sep10Module,
    Sep24Module,
    TaskModule,
    TierModule,
    AdminTaskModule,
    AdminTierModule,
    AdminUserModule,
    OwnerUserModule
  ],
  controllers: [], // No controllers are defined in this module
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Lifecycle hook called after the module has been initialized.
   * It checks if the API_KEY is provided in the environment configuration.
   * If the API_KEY is missing, it throws an error.
   */
  onModuleInit() {
    const apiKey = this.configService.get<string>("apiKey");
    if (!apiKey) throw new Error("API Key is required.");

    // Log successful database connection
    Logger.log("[DATABASE] connection successful", "AppModule");
  }
}
