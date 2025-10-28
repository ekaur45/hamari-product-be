import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class InviteTeacherDto {
  @ApiProperty({
    description: 'Teacher email address',
    example: 'teacher@example.com',
  })
  @IsNotEmpty({ message: 'Teacher email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Invitation message',
    example: 'We would like to invite you to join our academy as a teacher.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  message?: string;
}
