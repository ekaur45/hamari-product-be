import { Module } from "@nestjs/common";
import SharedModule from "../shared/shared.module";
import { CurrencyController } from "./currency.controller";

@Module({
    imports: [SharedModule],
    controllers: [CurrencyController],
    providers: [],
    exports: [],
})
export class CurrencyModule {}