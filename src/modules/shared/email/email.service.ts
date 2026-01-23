import { Injectable } from "@nestjs/common";
import { SmtpService } from "./smtp.service";
import User from "src/database/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { SentMessageInfo } from "nodemailer";
@Injectable()
export class EmailService {
    constructor(
        private readonly smtpService: SmtpService,
        private readonly configService: ConfigService,
    ) { }

    private getCompanyDetails() {
        const companyDetails = {
            companyName: this.configService.get('COMPANY_NAME'),
            companyAddress: this.configService.get('COMPANY_ADDRESS'),
            supportLink: this.configService.get('COMPANY_SUPPORT_LINK'),
            helpCenterLink: this.configService.get('COMPANY_HELP_CENTER_LINK'),
            socialMediaLinksWebsite: this.configService.get('COMPANY_SOCIAL_MEDIA_LINKS_WEBSITE'),
            socialMediaLinksMobile: this.configService.get('COMPANY_SOCIAL_MEDIA_LINKS_MOBILE'),
            socialMediaLinksLinkedin: this.configService.get('COMPANY_SOCIAL_MEDIA_LINKS_LINKEDIN'),
            companyEmail: this.configService.get('COMPANY_EMAIL'),
            companyPhone: this.configService.get('COMPANY_PHONE')
        }
        return companyDetails;
    }
    async sendOtpEmail(to: string, otp: string) {
        const mail = await this.smtpService.sendEmail(to, 'OTP Verification', 'otp-verification', {
            otpCode: otp,
            companyName: "Taleemiyat",
            name: "Waqas Ahmad",
            year: new Date().getFullYear(),
        });
        return mail;
    }

    async sendRegisterEmailOtp(user: User, otpCode: string): Promise<SentMessageInfo> {

        const context = {
            ...this.getCompanyDetails(),
            name: user.firstName + ' ' + user.lastName,
            otpCode: otpCode,
            verificationUrl: this.configService.get('COMPANY_VERIFICATION_URL') + otpCode,
            generatedTime: new Date().toISOString(),
        }
        const mail = await this.smtpService.sendEmail(user.email, 'OTP Verification', 'otp-verification', context);
        return mail;
    }
    async sendLoginEmailOtp(user: User, otpCode: string): Promise<SentMessageInfo> {

        const context = {
            ...this.getCompanyDetails(),
            name: user.firstName + ' ' + user.lastName,
            otpCode: otpCode,
            verificationUrl: this.configService.get('COMPANY_VERIFICATION_URL') + otpCode,
            generatedTime: new Date().toISOString(),
        }
        const mail = await this.smtpService.sendEmail(user.email, 'Login OTP Verification', 'otp-verification', context);
        return mail;
    }
}