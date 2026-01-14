import { Module } from "@nestjs/common";
import SharedModule from "../shared/shared.module";
import { NationalityController } from "./nationality.controller";
import { NationalityService } from "./nationality.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import Nationality from "src/database/entities/nationality.entity";
@Module({
    imports: [SharedModule, TypeOrmModule.forFeature([Nationality])],
    controllers: [NationalityController],
    providers: [NationalityService],
    exports: [NationalityService],
  })
  export class NationalityModule {}