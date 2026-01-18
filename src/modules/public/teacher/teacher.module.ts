import { Module } from "@nestjs/common";
import { TeacherController } from "./teacher.controller";
import { TeacherService } from "./teacher.service";
import SharedModule from "src/modules/shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [TeacherController],
    providers: [TeacherService],
    exports: [],
})
export class TeacherModule { }