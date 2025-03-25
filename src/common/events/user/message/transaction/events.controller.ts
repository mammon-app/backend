import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { TransactionMessageEventsService } from "./events.service";

@Controller()
export class TransactionMessageEventsController {
  constructor(
    private readonly eventsService: TransactionMessageEventsService
  ) {}

  @EventPattern("send:withdrawal:email")
  async sendWithdrawalEmail(@Payload() payload, @Ctx() context: RmqContext) {
    await this.eventsService.sendWithdrawalEmail(payload, context);
    return;
  }
}
