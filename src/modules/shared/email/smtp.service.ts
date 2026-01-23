import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SentMessageInfo } from "nodemailer";
import { LoggerService } from "src/modules/logger/logger.service";
@Injectable()
export class SmtpService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly logger: LoggerService,
    ) { }

    async sendEmail(to: string, subject: string, template: string, context: any): Promise<SentMessageInfo> {
        try {
            const mail = await this.mailerService.sendMail({
                to,
                subject,
                template,
                context,
            });
            return mail;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }
}