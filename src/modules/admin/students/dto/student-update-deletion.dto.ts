import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class StudentUpdateDeletionDto {
    @ApiProperty({ description: 'Soft delete flag for student', example: true })
    @IsBoolean()
    isDeleted: boolean;
}

