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
} from 'class-validator';
import { ClassType } from '../../shared/enums';

export class CreateClassDto {
  @ApiProperty({ description: 'Class title', example: 'Advanced Mathematics' })
  @IsNotEmpty({ message: 'Class title is required' })
  @IsString({ message: 'Class title must be a string' })
  title: string;

  @ApiProperty({
    description: 'Class description',
    example: 'Advanced mathematics course covering calculus and algebra',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Class type',
    enum: ClassType,
    example: ClassType.INDIVIDUAL,
  })
  @IsNotEmpty({ message: 'Class type is required' })
  @IsEnum(ClassType, { message: 'Invalid class type' })
  type: ClassType;

  @ApiProperty({
    description: 'Class start time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: string;

  @ApiProperty({
    description: 'Class end time',
    example: '2024-01-15T11:00:00Z',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
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
    description: 'Class fee',
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

  @ApiProperty({
    description: 'Academy ID (required for academy classes)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Academy ID must be a valid UUID' })
  academyId?: string;

  // Compatibility fields for front-end variant (optional)
  @ApiProperty({ required: false, description: 'Alternative: name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Alternative: startDate' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Alternative: endDate' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Teacher to assign (owner only)' })
  @IsOptional()
  @IsUUID(4)
  teacherId?: string;
}
