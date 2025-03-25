import { Module } from '@nestjs/common';
import { InternalCacheModule } from '../../../internal-cache/internal-cache.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Sep10Service } from './sep10.service';
import { Sep10Controller } from './sep10.controller';
import { Sep1Service } from '../sep1/sep1.service';

/**
 * The Sep10Module is responsible for handling SEP-10 authentication related functionalities.
 * It imports necessary modules, provides services, and declares controllers.
 */
@Module({
  imports: [
    // Importing the MongooseModule to interact with the User schema in MongoDB.
    MongooseModule.forFeature([
      {
        name: User.name, // Name of the model to be used in Mongoose.
        schema: UserSchema, // Schema definition for the User model.
      },
    ]),
    InternalCacheModule, // Importing InternalCacheModule for caching functionalities.
  ],
  controllers: [Sep10Controller], // Declaring the controller for handling incoming HTTP requests.
  providers: [Sep10Service, Sep1Service], // Providing the Sep10Service and Sep1Service for dependency injection.
  exports: [Sep10Service], // Exporting Sep10Service to be used in other modules.
})
export class Sep10Module {}
