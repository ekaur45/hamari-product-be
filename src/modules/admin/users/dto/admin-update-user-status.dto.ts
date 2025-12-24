import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class AdminUpdateUserStatusDto {
    @ApiProperty({ description: 'User active status', example: true })
    @IsBoolean()
    isActive: boolean;
}

