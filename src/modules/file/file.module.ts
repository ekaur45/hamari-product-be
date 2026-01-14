import { Module } from "@nestjs/common";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import SharedModule from "../shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [FileController],
    providers: [FileService],
    exports: [FileService],
})
export class FileModule {}