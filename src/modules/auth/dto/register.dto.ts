import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type UserType from 'src/modules/shared/models/roles.model';

export default class RegisterDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'First name is required.' })
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Last name is required.' })
  lastName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email provided.' })
  email: string;

  @IsOptional()
  username: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @ApiProperty({ required: true, default: 'Other' })
  @IsNotEmpty({ message: 'Role is required.' })
  role: UserType;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Agree to terms and conditions is required.' })
  @IsBoolean({ message: 'Agree to terms and conditions is required.' })
  agreeToTerms: boolean;

  @ApiProperty({ required: false })
  @IsString({ message: 'Phone must be a string.' })
  @IsOptional()
  phone?: string;
}
