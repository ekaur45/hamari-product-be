import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class TeacherUpdateDeletionDto {
    @ApiProperty({ description: 'Soft delete flag for teacher', example: true })
    @IsBoolean()
    isDeleted: boolean;
}

