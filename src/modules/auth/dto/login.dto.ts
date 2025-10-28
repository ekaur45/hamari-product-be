import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class LoginDto {
  @ApiProperty({ required: true })
  @IsEmail({}, { message: 'Invalid email provided.' })
  @IsNotEmpty()
  username: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  password: string;
}
