import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ClassStatus } from "src/modules/shared/enums";

export default class AdminUpdateClassStatusDto {
    @ApiProperty({ enum: ClassStatus, description: 'Class status' })
    @IsEnum(ClassStatus)
    status: ClassStatus;

    @ApiProperty({ description: 'Cancellation reason (required when status = cancelled)', required: false, maxLength: 255 })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    cancelReason?: string;
}

