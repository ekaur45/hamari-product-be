import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { TeacherModule } from "./teacher/teacher.module";
import SharedModule from "../shared/shared.module";

@Module({
    controllers: [PublicController],
    imports: [SharedModule, TeacherModule],
})
export class PublicModule { }