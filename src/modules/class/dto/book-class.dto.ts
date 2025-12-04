import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from "class-validator";
import { MonthOfYear, PaymentMethod, PaymentStatus } from "src/modules/shared/enums";

export class BookClassDto {
    @ApiProperty({ description: 'Month', example: 'January' })
    @IsNotEmpty({ message: 'Month is required' })
    @IsEnum(MonthOfYear, { message: 'Invalid month' })
    month: MonthOfYear;

    @ApiProperty({ description: 'Year', example: 2025 })
    @IsNotEmpty({ message: 'Year is required' })
    @IsNumber({}, { message: 'Year must be a number' })
    year: number;

    @ApiProperty({ description: 'Class ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID(4, { message: 'Class ID must be a valid UUID' })
    classId?: string;

    @ApiProperty({ description: 'Student ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID(4, { message: 'Student ID must be a valid UUID' })
    studentId?: string;

    @ApiProperty({ description: 'Payment method', example: 'credit_card' })
    @IsOptional()
    @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
    paymentMethod: PaymentMethod;

    @ApiProperty({ description: 'Payment status', example: 'pending' })
    @IsOptional()
    @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
    paymentStatus: PaymentStatus;
}