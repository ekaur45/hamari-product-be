import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsPositive, IsString, Matches, MaxLength, Min } from "class-validator";

export default class AdminUpdateClassScheduleDto {
    @ApiProperty({ description: 'Start time (HH:MM:SS)', example: '09:00:00', required: false })
    @IsOptional()
    @Matches(/^\d{2}:\d{2}:\d{2}$/, { message: 'startTime must be HH:MM:SS' })
    startTime?: string;

    @ApiProperty({ description: 'End time (HH:MM:SS)', example: '10:00:00', required: false })
    @IsOptional()
    @Matches(/^\d{2}:\d{2}:\d{2}$/, { message: 'endTime must be HH:MM:SS' })
    endTime?: string;

    @ApiProperty({ description: 'Duration in minutes', example: 60, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    duration?: number;

    @ApiProperty({ description: 'Max students', example: 10, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    maxStudents?: number;

    @ApiProperty({ description: 'Schedule days', example: ['Monday','Wednesday'], required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(20, { each: true })
    scheduleDays?: string[];
}

