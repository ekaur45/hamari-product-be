import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SentMessageInfo } from "nodemailer";
@Injectable()
export class SmtpService {
    constructor(
        private readonly mailerService: MailerService,
    ) {}

    async sendEmail(to: string, subject: string, template: string, context: any):Promise<SentMessageInfo> {
        const mail = await this.mailerService.sendMail({
            to,
            subject,
            template,
            context,
        });
        return mail;
    }
}