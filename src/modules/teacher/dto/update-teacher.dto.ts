import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class UpdateTeacherDto {
  @ApiProperty({
    description: 'Employee ID within the academy',
    example: 'EMP001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Employee ID must be a string' })
  employeeId?: string;

  @ApiProperty({
    description: 'Department the teacher belongs to',
    example: 'Mathematics',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  department?: string;

  @ApiProperty({
    description: 'Teacher specialization or subject area',
    example: 'Advanced Mathematics',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Specialization must be a string' })
  specialization?: string;

  @ApiProperty({
    description: 'Teacher qualification or degree',
    example: 'MSc Mathematics',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Qualification must be a string' })
  qualification?: string;

  @ApiProperty({
    description: 'Years of teaching experience',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Experience must be a number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(50, { message: 'Experience cannot exceed 50 years' })
  experience?: number;

  @ApiProperty({
    description: 'Whether the teacher is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Teacher role in the academy',
    example: 'TEACHER',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  role?: string;

  @ApiProperty({
    description: 'Monthly salary',
    example: 5000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Salary must be a number' })
  @Min(0, { message: 'Salary cannot be negative' })
  salary?: number;

  @ApiProperty({
    description: 'Additional notes about the teacher',
    example: 'Specializes in calculus and algebra',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
