import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
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
}
