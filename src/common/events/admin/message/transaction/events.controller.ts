import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { AdminTransactionMessageEventsService } from "./events.service";

@Controller()
export class AdminTransactionMessageEventsController {
  constructor(
    private readonly eventsService: AdminTransactionMessageEventsService
  ) {}

  @EventPattern("send:fait:withdrawal:email")
  async sendFiatWithdrawalEmail(@Payload() payload, @Ctx() context: RmqContext) {
    await this.eventsService.sendFiatWithdrawalEmail(payload, context);
    return;
  }
}
