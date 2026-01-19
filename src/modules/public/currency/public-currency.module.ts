import { Module } from "@nestjs/common";
import SharedModule from "../../shared/shared.module";
import { PublicCurrencyController } from "./public-currency.controller";


@Module({
    imports: [SharedModule],
    controllers: [PublicCurrencyController],
    providers: [],
    exports: [],
})
export class PublicCurrencyModule {}