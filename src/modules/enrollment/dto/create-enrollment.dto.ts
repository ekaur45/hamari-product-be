import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'Class ID to enroll in',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsUUID(4, { message: 'Class ID must be a valid UUID' })
  classId: string;

  @ApiProperty({
    description: 'Enrollment notes',
    example: 'Interested in advanced topics',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
