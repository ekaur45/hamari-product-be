import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export default class TeacherUpdateVerificationDto {
    @ApiProperty({ description: 'Teacher verification status', example: true })
    @IsBoolean()
    isVerified: boolean;

    @ApiProperty({ description: 'Verification note / rejection reason', example: 'ID verified', required: false, maxLength: 255 })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    note?: string;
}

