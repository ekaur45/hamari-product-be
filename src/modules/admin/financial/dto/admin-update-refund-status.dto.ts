import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { RefundStatus } from "src/database/entities/refund.entity";

export default class AdminUpdateRefundStatusDto {
    @ApiProperty({ enum: RefundStatus })
    @IsEnum(RefundStatus)
    status: RefundStatus;

    @ApiProperty({ description: 'Optional reason', required: false, maxLength: 255 })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string;
}

