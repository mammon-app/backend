import { Module } from "@nestjs/common";
import { MFAService } from "./mfa.service";
import { MFAController } from "./mfa.controller";
import { MFA, MFASchema } from "src/schemas/mfa.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/user.schema";

/**
 * MFAModule is a NestJS module that encapsulates all logic related to Multi-Factor Authentication (MFA).
 * This module imports Mongoose schemas for both MFA and User, which are essential for interacting with
 * MongoDB collections corresponding to these entities.
 */
@Module({
  imports: [
    // Importing MongooseModule and defining the schemas for MFA and User.
    MongooseModule.forFeature([
      {
        name: MFA.name, // The name of the model for MFA
        schema: MFASchema, // The schema definition for the MFA model
      },
      {
        name: User.name, // The name of the model for User
        schema: UserSchema, // The schema definition for the User model
      },
    ]),
  ],
  controllers: [MFAController], // Registering the MFAController to handle incoming requests related to MFA
  providers: [MFAService], // Registering the MFAService to handle business logic related to MFA
})
export class MFAModule {} // Exporting the MFAModule to be used in the application
