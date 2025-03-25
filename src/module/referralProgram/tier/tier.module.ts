import { Module } from '@nestjs/common';
import { TierService } from './tier.service';
import { TierController } from './tier.controller';
import { Tier, TierSchema } from 'src/schemas/tier.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { InternalCacheModule } from '../../../internal-cache/internal-cache.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tier.name,
        schema: TierSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    InternalCacheModule,
  ],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule {}
