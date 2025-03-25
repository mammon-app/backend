import { Injectable } from "@nestjs/common";
import { Ctx, Payload, RmqContext } from "@nestjs/microservices";
import {
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
} from "src/config/env.config";
import { SendCodeEmail } from "src/templates/send-code-email";
import * as nodemailer from "nodemailer";
import { WelcomeEmail } from "src/templates/welcome-email";

@Injectable()
export class MessageEventsService {
  async sendOTPEmail(@Payload() payload, @Ctx() context: RmqContext) {
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
        to: payload.to.toLowerCase(),
        subject: payload.subject,
        html: SendCodeEmail(
          payload.subject,
          payload.content,
          payload.code,
          payload.username
        ),
      };

      await new Promise((resolve, reject) => {
        smtp.sendMail(mailOptions, (err: any, res: any) => {
          if (err) {
            console.error(
              "Error occurred while sending the sendOTPEmail:",
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

  async sendGeneralEmail(@Payload() payload, @Ctx() context: RmqContext) {
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
        to: payload.to.toLowerCase(),
        subject: payload.subject,
        html: WelcomeEmail(
          payload.subject,
          payload.username,
          payload.appName,
          payload.featureLink,
          payload.profileLink,
          payload.communityLink,
          payload.socialMediaLink,
          payload.supportEmail,
        ),
      };

      await new Promise((resolve, reject) => {
        smtp.sendMail(mailOptions, (err: any, res: any) => {
          if (err) {
            console.error(
              "Error occurred while sending the sendGeneralEmail:",
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
