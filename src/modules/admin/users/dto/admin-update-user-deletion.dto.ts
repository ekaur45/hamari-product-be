import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class AdminUpdateUserDeletionDto {
    @ApiProperty({ description: 'Soft delete flag', example: true })
    @IsBoolean()
    isDeleted: boolean;
}

