import { Injectable } from "@nestjs/common";
import { Ctx, Payload, RmqContext } from "@nestjs/microservices";
import {
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
} from "src/config/env.config";
import * as nodemailer from "nodemailer";
import { FiatWithdrawalEmail } from "src/templates/fiat-withdrawal-email";

@Injectable()
export class AdminTransactionMessageEventsService {
  async sendFiatWithdrawalEmail(
    @Payload() payload,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const smtp = nodemailer.createTransport({
        host: EMAIL_HOST,
        secure: true,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: EMAIL_USERNAME,
        to: payload.to,
        subject: payload.subject,
        html: FiatWithdrawalEmail(
          payload.subject,
          payload.appName,
          payload.username,
          payload.email,
          payload.amount,
          payload.currency,
          payload.userAddress,
          payload.receiverAddress,
          payload.txHash,
          payload.accountNumber,
          payload.accountName,
          payload.bankName,
          payload.txDate
        ),
      };

      await new Promise((resolve, reject) => {
        smtp.sendMail(mailOptions, (err: any, res: any) => {
          if (err) {
            console.error(
              "Error occurred while sending the sendFiatWithdrawalEmail:",
              err.message
            );
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
      channel.ack(originalMsg);
      return;
    } catch (error) {
      console.log(error);
    }
  }
}
