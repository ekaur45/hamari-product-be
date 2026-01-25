import { Module } from "@nestjs/common";
import SharedModule from "src/modules/shared/shared.module";
import { AdminLogsController } from "./logs.controller";
import { AdminLogsService } from "./admin-logs.service";

@Module({
    imports: [SharedModule],
    controllers: [AdminLogsController],
    providers: [AdminLogsService],
    exports: [AdminLogsService],
})
export class AdminLogsModule {}

