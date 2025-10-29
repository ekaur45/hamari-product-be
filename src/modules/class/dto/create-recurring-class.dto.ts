import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ClassType } from '../../shared/enums';

export class CreateRecurringClassDto {
  @ApiProperty({ description: 'Class title', example: 'Chemistry - February 2024' })
  @IsNotEmpty({ message: 'Class title is required' })
  @IsString({ message: 'Class title must be a string' })
  title: string;

  @ApiProperty({
    description: 'Class description',
    example: 'Monthly chemistry course covering organic chemistry',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Class type',
    enum: ClassType,
    example: ClassType.ACADEMY,
  })
  @IsNotEmpty({ message: 'Class type is required' })
  @IsEnum(ClassType, { message: 'Invalid class type' })
  type: ClassType;

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
    description: 'Academy ID (required for academy classes)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Academy ID must be a valid UUID' })
  academyId?: string;

  @ApiProperty({
    description: 'Start date of the recurring period',
    example: '2024-02-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @ApiProperty({
    description: 'End date of the recurring period',
    example: '2024-02-29T23:59:59Z',
  })
  @IsNotEmpty({ message: 'End date is required' })
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate: string;

  @ApiProperty({
    description: 'Days of the week when class occurs',
    example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    type: [String],
  })
  @IsNotEmpty({ message: 'Days of week are required' })
  @IsArray({ message: 'Days must be an array' })
  @IsString({ each: true, message: 'Each day must be a string' })
  daysOfWeek: string[];

  @ApiProperty({
    description: 'Start time of each class',
    example: '09:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  startTime: string;

  @ApiProperty({
    description: 'End time of each class',
    example: '10:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  endTime: string;

  @ApiProperty({
    description: 'Maximum number of students',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max students must be a number' })
  @Min(1, { message: 'Max students must be at least 1' })
  maxStudents?: number;

  @ApiProperty({
    description: 'Class fee per session',
    example: 50.0,
  })
  @IsNotEmpty({ message: 'Class fee is required' })
  @IsNumber({}, { message: 'Class fee must be a number' })
  @Min(0, { message: 'Class fee must be non-negative' })
  fee: number;

  @ApiProperty({
    description: 'Class location',
    example: 'Room 101, Building A',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiProperty({
    description: 'Meeting link for online classes',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Meeting link must be a string' })
  meetingLink?: string;
}
