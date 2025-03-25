import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessageEventsService } from './events.service';

@Controller()
export class MessageEventsController {
  constructor(private readonly eventsService: MessageEventsService) {}

  @EventPattern('send:general:email')
  async sendGeneralEmail(@Payload() payload, @Ctx() context: RmqContext) {
    await this.eventsService.sendGeneralEmail(payload, context);
    return;
  }

  @EventPattern('send:otp:email')
  async sendOTPEmail(@Payload() payload, @Ctx() context: RmqContext) {
    await this.eventsService.sendOTPEmail(payload, context);
    return;
  }
}
