import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString, IsArray, Min, Max } from 'class-validator';
import { AssignmentType, AssignmentStatus } from 'src/database/entities/assignment.entity';

export class UpdateAssignmentDto {
  @ApiProperty({ description: 'Assignment title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Assignment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType, required: false })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiProperty({ description: 'Maximum score', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @ApiProperty({ description: 'Weight in final grade calculation', required: false })
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

  @ApiProperty({ description: 'Allow late submission', required: false })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @ApiProperty({ description: 'Late penalty percentage per day', required: false })
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

  @ApiProperty({ description: 'Assignment status', enum: AssignmentStatus, required: false })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
}

