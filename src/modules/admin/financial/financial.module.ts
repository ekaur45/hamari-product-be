import { Module } from "@nestjs/common";
import SharedModule from "src/modules/shared/shared.module";
import { AdminFinancialController } from "./financial.controller";
import { AdminFinancialService } from "./financial.service";

@Module({
    imports: [SharedModule],
    controllers: [AdminFinancialController],
    providers: [AdminFinancialService],
    exports: [AdminFinancialService],
})
export class AdminFinancialModule {}

