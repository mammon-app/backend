import { MessageEventsService } from './events.service';
import { MessageEventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [MessageEventsController],
  providers: [MessageEventsService],
})
export class MessageEventsModule {}
