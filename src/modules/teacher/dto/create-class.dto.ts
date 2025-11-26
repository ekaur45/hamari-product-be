import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateClassDto {
    @ApiProperty({ description: 'Teacher ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty({ message: 'Teacher ID is required' })
    @IsUUID(4, { message: 'Teacher ID must be a valid UUID' })
    teacherId: string;
    
    @ApiProperty({ description: 'Subject ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty({ message: 'Subject ID is required' })
    @IsUUID(4, { message: 'Subject ID must be a valid UUID' })
    subjectId: string;

    @ApiProperty({ description: 'Price', example: 100 })
    @IsOptional()
    @IsNumber({}, { message: 'Price must be a number' })
    price: number;
    
    @ApiProperty({ description: 'Start time', example: '10:00' })
    @IsNotEmpty({ message: 'Start time is required' })
    @IsString({ message: 'Start time must be a string' })
    startTime: string;
    
    @ApiProperty({ description: 'End time', example: '11:00' })
    @IsNotEmpty({ message: 'End time is required' })
    @IsString({ message: 'End time must be a string' })
    endTime: string;
    
    @ApiProperty({ description: 'Duration', example: 60 })
    @IsNotEmpty({ message: 'Duration is required' })
    @IsNumber({}, { message: 'Duration must be a number' })
    duration: number;
    
    @ApiProperty({ description: 'Max students', example: 10 })
    @IsNotEmpty({ message: 'Max students is required' })
    @IsNumber({}, { message: 'Max students must be a number' })
    maxStudents: number;


    @ApiProperty({ description: 'Schedule days', example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] })
    @IsOptional()
    @IsArray({ message: 'Schedule days must be an array' })
    @IsString({ each: true, message: 'Schedule days must be an array of strings' })
    schedule: string[];
}