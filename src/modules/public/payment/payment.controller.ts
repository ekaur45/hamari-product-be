import { Controller, Headers, Post, Req, Res } from "@nestjs/common";
import PaymentService from "./payment.service";
import { PUBLIC_API_PAYMENT_BASE } from "src/utils/api.constants";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import express from "express";
import { LoggerService } from "src/modules/logger/logger.service";

@Controller(PUBLIC_API_PAYMENT_BASE)
export default class PaymentController {
    private readonly stripe: Stripe;
    constructor(private readonly paymentService: PaymentService, private readonly configService: ConfigService, private readonly logger: LoggerService) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2025-12-15.clover',
        });
    }

    @Post('stripe/webhook')
    async stripeWebhook(
        @Req() req: express.Request,
        @Res() res: express.Response,
        @Headers('stripe-signature') signature: string
    ) {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
        let event: Stripe.Event;

        try {
            const buf = req.body as Buffer;

            event = this.stripe.webhooks.constructEvent(buf, signature, webhookSecret);

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                this.logger.log('Payment succeeded:', paymentIntent.id);
            }
            if (event.type === 'checkout.session.completed') {
                const checkoutSession = event.data.object as Stripe.Checkout.Session;
                await this.paymentService.processCheckoutSession(checkoutSession);
            }
            res.json({ received: true });

        } catch (err) {
            this.logger.error('Webhook Error:', err.message);
            res.json({ received: false });
        }
    }

}
