import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({
    description: 'User ID of the teacher',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Academy ID where the teacher will be assigned',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Academy ID is required' })
  @IsUUID('4', { message: 'Academy ID must be a valid UUID' })
  academyId: string;

  @ApiProperty({
    description: 'Employee ID within the academy',
    example: 'EMP001',
  })
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString({ message: 'Employee ID must be a string' })
  employeeId: string;

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
