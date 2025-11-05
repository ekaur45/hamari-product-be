import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { AvailabilityDay } from "src/database/entities/availablility.entity";
import { SubjectSkillLevel } from "src/database/entities/teacher-subject.entity";

export default class UpdateProfileDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
    })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
    })
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;
}

export class UpdateProfessionalInfoDto {
    @ApiProperty({
        description: 'Preferred subject',
        example: 'Mathematics',
    })
    @IsString()
    @IsOptional()
    preferredSubject: string;

    @ApiProperty({
        description: 'Years of experience',
        example: 5,
    })
    @IsNumber()
    @IsOptional()
    yearsOfExperience: number;

    @ApiProperty({
        description: 'Tagline',
        example: 'I am a Math teacher with 5 years of experience',
    })
    @IsString()
    @IsOptional()
    bio: string;
}

export class UpdateProfileBioDto {
    @ApiProperty({
        description: 'Profile bio',
        example: 'I am a student of Mathematics',
    })
    @IsString()
    @IsOptional()
    bio: string;
}

export class UpdateUserEducationDto {
    @ApiProperty({
        description: 'Institute name',
        example: 'University of Cambridge',
    })
    @IsString()
    @IsOptional()
    instituteName: string;


    @ApiProperty({
        description: 'Degree name',
        example: 'Bachelor of Science',
    })
    @IsString()
    @IsOptional()
    degreeName: string;


    @ApiProperty({
        description: 'Started year',
        example: 2020,
    })
    @IsNumber()
    @IsOptional()
    startedYear: number;


    @ApiProperty({
        description: 'Ended year',
        example: 2024,
    })
    @IsNumber()
    @IsOptional()
    endedYear: number;


    @ApiProperty({
        description: 'Is still studying',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isStillStudying: boolean;


    @ApiProperty({
        description: 'Remarks',
        example: 'I graduated with honors',
    })
    @IsString()
    @IsOptional()
    remarks: string;
}


export class UpdateUserSubjectsDto {
    @ApiProperty({
        description: 'Subjects',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    id?: string;

    @ApiProperty({
        description: 'Name',
        example: 'Mathematics',
    })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({
        description: 'Skill level',
        example: SubjectSkillLevel.Started,
    })
    @IsEnum(SubjectSkillLevel)
    @IsOptional()
    skillLevel: SubjectSkillLevel;
}


export class AddAvailabilityDto {
    @ApiProperty({
        description: 'Day',
        example: 'Sunday',
    })
    @IsEnum(AvailabilityDay)
    @IsNotEmpty({ message: 'Day is required' })
    dayOfWeek: AvailabilityDay;
    
    @ApiProperty({
        description: 'Start time',
        example: '10:00',
    })
    @IsString()
    @IsNotEmpty({ message: 'Start time is required' })
    startTime: string; 

    @ApiProperty({
        description: 'End time',
        example: '12:00',
    })
    @IsString()
    @IsNotEmpty({ message: 'End time is required' })
    endTime: string;
    
    @ApiProperty({
        description: 'Notes',
        example: 'I am available on Sunday from 10:00 to 12:00',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}