import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { RelationshipType } from '../../shared/enums';

export class CreateParentChildDto {
  @ApiProperty({
    description: 'Child ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Child ID is required' })
  @IsUUID(4, { message: 'Child ID must be a valid UUID' })
  childId: string;

  @ApiProperty({
    description: 'Relationship type',
    enum: RelationshipType,
    example: RelationshipType.FATHER,
  })
  @IsNotEmpty({ message: 'Relationship type is required' })
  @IsEnum(RelationshipType, { message: 'Invalid relationship type' })
  relationshipType: RelationshipType;

  @ApiProperty({
    description: 'Relationship notes',
    example: 'Primary guardian',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
