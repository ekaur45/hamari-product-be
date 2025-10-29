import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateAcademyDto {
  @ApiProperty({ description: 'Academy name', example: 'Tech Academy' })
  @IsNotEmpty({ message: 'Academy name is required' })
  @IsString({ message: 'Academy name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Academy description',
    example: 'A leading technology education academy',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Academy address',
    example: '123 Education Street, City, Country',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({
    description: 'Academy phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiProperty({
    description: 'Academy email',
    example: 'info@techacademy.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email?: string;

  @ApiProperty({
    description: 'Academy website',
    example: 'https://techacademy.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @ApiProperty({
    description: 'Monthly fee for academy classes',
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Monthly fee must be a number' })
  @Min(0, { message: 'Monthly fee must be non-negative' })
  monthlyFee?: number;

  @ApiProperty({
    description: 'Individual class fee',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Individual class fee must be a number' })
  @Min(0, { message: 'Individual class fee must be non-negative' })
  individualClassFee?: number;

  @ApiProperty({
    description: 'Academy logo URL or base64 string',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;
}
