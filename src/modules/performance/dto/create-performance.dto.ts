import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { PerformanceType } from '../../shared/enums';

export class CreatePerformanceDto {
  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsUUID(4, { message: 'Student ID must be a valid UUID' })
  studentId: string;

  @ApiProperty({
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsUUID(4, { message: 'Class ID must be a valid UUID' })
  classId: string;

  @ApiProperty({
    description: 'Performance type',
    enum: PerformanceType,
    example: PerformanceType.QUIZ,
  })
  @IsNotEmpty({ message: 'Performance type is required' })
  @IsEnum(PerformanceType, { message: 'Invalid performance type' })
  type: PerformanceType;

  @ApiProperty({
    description: 'Performance title',
    example: 'Mathematics Quiz - Chapter 5',
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({
    description: 'Performance description',
    example: 'Quiz covering algebraic equations and functions',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Score achieved',
    example: 85,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Score must be a number' })
  @Min(0, { message: 'Score must be non-negative' })
  score?: number;

  @ApiProperty({
    description: 'Maximum possible score',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max score must be a number' })
  @Min(0, { message: 'Max score must be non-negative' })
  maxScore?: number;

  @ApiProperty({
    description: 'Teacher feedback',
    example: 'Good work! Keep practicing algebraic equations.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Feedback must be a string' })
  feedback?: string;

  @ApiProperty({
    description: 'Performance date',
    example: '2024-01-15T10:00:00Z',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid date' })
  date: string;
}
