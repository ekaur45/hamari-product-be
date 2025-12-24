import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class TeacherUpdateStatusDto {
    @ApiProperty({ description: 'Teacher active status', example: true })
    @IsBoolean()
    isActive: boolean;
}

