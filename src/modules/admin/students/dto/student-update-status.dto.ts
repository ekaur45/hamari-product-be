import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class StudentUpdateStatusDto {
    @ApiProperty({ description: 'Student active status', example: true })
    @IsBoolean()
    isActive: boolean;
}

