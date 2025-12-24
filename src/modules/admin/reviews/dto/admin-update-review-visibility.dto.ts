import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export default class AdminUpdateReviewVisibilityDto {
    @ApiProperty({ description: 'Set review visibility', example: true })
    @IsBoolean()
    isVisible: boolean;
}

