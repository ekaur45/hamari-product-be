import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../shared/enums';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 50.0,
  })
  @IsNotEmpty({ message: 'Payment amount is required' })
  @IsNumber({}, { message: 'Payment amount must be a number' })
  @Min(0, { message: 'Payment amount must be non-negative' })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.ONLINE,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Transaction ID must be a string' })
  transactionId?: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Payment for Mathematics class',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Payment notes',
    example: 'Additional payment information',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiProperty({
    description: 'Class ID (if payment is for a specific class)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Class ID must be a valid UUID' })
  classId?: string;

  @ApiProperty({
    description: 'Enrollment ID (if payment is for an enrollment)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Enrollment ID must be a valid UUID' })
  enrollmentId?: string;
}
