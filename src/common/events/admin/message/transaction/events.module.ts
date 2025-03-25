import { AdminTransactionMessageEventsService } from "./events.service";
import { AdminTransactionMessageEventsController } from "./events.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [AdminTransactionMessageEventsController],
  providers: [AdminTransactionMessageEventsService],
})
export class AdminTransactionMessageEventsModule {}
