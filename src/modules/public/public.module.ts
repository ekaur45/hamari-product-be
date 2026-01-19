import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { TeacherModule } from "./teacher/teacher.module";
import SharedModule from "../shared/shared.module";
import PaymentModule from "./payment/payment.module";
import { PublicCurrencyModule } from "./currency/public-currency.module";

@Module({
    controllers: [PublicController],
    imports: [SharedModule, TeacherModule, PaymentModule,PublicCurrencyModule],
    providers: [],
    exports: [],
})
export class PublicModule { }