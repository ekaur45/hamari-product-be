import { Module } from "@nestjs/common";
import SharedModule from "src/modules/shared/shared.module";
import { AdminSupportController } from "./support.controller";
import { AdminSupportService } from "./support.service";

@Module({
    imports: [SharedModule],
    controllers: [AdminSupportController],
    providers: [AdminSupportService],
    exports: [AdminSupportService],
})
export class AdminSupportModule {}

