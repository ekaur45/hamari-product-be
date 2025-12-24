import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'Submission text', required: false })
  @IsOptional()
  @IsString()
  submissionText?: string;

  @ApiProperty({ description: 'Array of file URLs/paths', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}

