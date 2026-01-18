import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
export class Slot {
  @ApiProperty({
    description: 'Day of week',
    example: 'monday',
  })
  @IsNotEmpty({ message: 'Day of week is required' })
  @IsString({ message: 'Day of week must be a string' })
  dayOfWeek: string;
  @ApiProperty({
    description: 'Start time',
    example: '10:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  startTime: string;
  @ApiProperty({
    description: 'End time',
    example: '11:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  endTime: string;
}
export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Payment method',
    example: 'card',
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsString({ message: 'Payment method must be a string' })
  paymentMethod: string;


  @ApiProperty({
    description: 'Selected date',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'Selected date is required' })
  @IsDateString({}, { message: 'Selected date must be a valid date' })
  selectedDate: Date;


  @ApiProperty({
    description: 'Slot',
    example: {
      dayOfWeek: 'monday',
      startTime: '10:00',
      endTime: '11:00',
    },
  })
  @IsNotEmpty({ message: 'Slot ID is required' })
  @IsUUID(4, { message: 'Slot ID must be a valid UUID' })
  slotId: string;

  @ApiProperty({
    description: 'Subject ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Subject ID is required' })
  @IsUUID(4, { message: 'Subject ID must be a valid UUID' })
  subjectId: string;


  @ApiProperty({
    description: 'Teacher ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsUUID(4, { message: 'Teacher ID must be a valid UUID' })
  teacherId: string;

  @ApiProperty({
    description: 'Total amount',
    example: 100,
  })
  @IsNotEmpty({ message: 'Total amount is required' })
  @IsNumber({}, { message: 'Total amount must be a number' })
  totalAmount: number;

  @ApiProperty({
    description: 'Coupon code',
    example: 'COUPON123',
  })
  @IsOptional()
  @IsString({ message: 'Coupon code must be a string' })
  couponCode?: string;
}
