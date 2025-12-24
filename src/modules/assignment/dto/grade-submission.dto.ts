import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Score obtained by student', example: 85 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Maximum score (defaults to assignment maxScore)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @ApiProperty({ description: 'Feedback for student', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}

