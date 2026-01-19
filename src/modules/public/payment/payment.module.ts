import { Module } from "@nestjs/common";
import PaymentController from "./payment.controller";
import PaymentService from "./payment.service";
import SharedModule from "src/modules/shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export default class PaymentModule { }