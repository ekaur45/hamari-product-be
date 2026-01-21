import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { EmailService } from "./email.service";
import { SmtpService } from "./smtp.service";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport:{
                    host: configService.get('SMTP_HOST'),
                    port: configService.get('SMTP_PORT',587),
                    auth: {
                        user: configService.get('SMTP_USERNAME'),
                        pass: configService.get('SMTP_PASSWORD'),
                    },
                },
                defaults:{
                    from: `${configService.get('SMTP_FROM_NAME')} <${configService.get('SMTP_FROM_EMAIL')}>`,
                },
                template:{
                    dir: join('src', 'email-templates'),
                    adapter: new HandlebarsAdapter(),
                },
                options:{
                    strict: true,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [EmailService, SmtpService],
    exports: [EmailService, SmtpService],
})
export class EmailModule { }