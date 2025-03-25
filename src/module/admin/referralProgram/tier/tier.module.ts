import { Module } from "@nestjs/common";
import { Tier, TierSchema } from "src/schemas/tier.schema";
import { Task, TaskSchema } from "src/schemas/task.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { InternalCacheModule } from "../../../../internal-cache/internal-cache.module";
import { MongooseModule } from "@nestjs/mongoose";
import { TierController } from "./tier.controller";
import { TierService } from "./tier.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tier.name,
        schema: TierSchema,
      },
      {
        name: Task.name,
        schema: TaskSchema,
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
export class AdminTierModule {}
