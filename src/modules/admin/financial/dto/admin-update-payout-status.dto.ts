import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PayoutStatus } from "src/database/entities/payout.entity";

export default class AdminUpdatePayoutStatusDto {
    @ApiProperty({ enum: PayoutStatus })
    @IsEnum(PayoutStatus)
    status: PayoutStatus;

    @ApiProperty({ description: 'Failure reason if failed/cancelled', required: false, maxLength: 255 })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    failureReason?: string;
}

