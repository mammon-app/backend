import { TransactionMessageEventsService } from "./events.service";
import { TransactionMessageEventsController } from "./events.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [TransactionMessageEventsController],
  providers: [TransactionMessageEventsService],
})
export class TransactionMessageEventsModule {}
