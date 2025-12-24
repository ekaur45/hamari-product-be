import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString, IsArray, Min, Max } from 'class-validator';
import { AssignmentType } from 'src/database/entities/assignment.entity';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment title', example: 'Math Homework Chapter 5' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Assignment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Class ID (for class assignments)', required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ description: 'Teacher booking ID (for one-on-one assignments)', required: false })
  @IsOptional()
  @IsString()
  teacherBookingId?: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType, default: AssignmentType.HOMEWORK })
  @IsEnum(AssignmentType)
  type: AssignmentType;

  @ApiProperty({ description: 'Maximum score', example: 100, default: 100 })
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiProperty({ description: 'Weight in final grade calculation', example: 10, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Last submission date', required: false })
  @IsOptional()
  @IsDateString()
  submissionDate?: string;

  @ApiProperty({ description: 'Allow late submission', default: false })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @ApiProperty({ description: 'Late penalty percentage per day', example: 5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  latePenalty?: number;

  @ApiProperty({ description: 'Assignment instructions', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Attachment file paths/URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ description: 'Grading rubric (JSON object)', required: false })
  @IsOptional()
  rubric?: any;
}

