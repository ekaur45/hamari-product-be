import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
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

    @ApiProperty({
        description: 'User phone number',
        example: '+923001234567',
    })
    @IsString()
    @IsOptional()
    phone: string;


    @ApiProperty({
        description: 'User nationality ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsOptional()
    nationalityId: string;

    @ApiProperty({
        description: 'User date of birth',
        example: '2000-01-01',
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dateOfBirth: Date;

    @ApiProperty({
        description: 'User gender',
        example: 'Male',
    })
    @IsString()
    @IsOptional()
    gender: string;

    @ApiProperty({
        description: 'User address',
        example: '123 Main St, Anytown, USA',
    })
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty({
        description: 'User city',
        example: 'Anytown',
    })
    @IsString()
    @IsOptional()
    city: string;

    @ApiProperty({
        description: 'User state',
        example: 'Anytown',
    })
    @IsString()
    @IsOptional()
    state: string;

    @ApiProperty({
        description: 'User country',
        example: 'USA',
    })
    @IsString()
    @IsOptional()
    country: string;

    @ApiProperty({
        description: 'User zip code',
        example: '12345',
    })
    @IsString()
    @IsOptional()
    zipCode: string;

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
        example: '5 years',
    })
    @IsString()
    @Type(() => String)
    @IsOptional()
    yearsOfExperience: string;

    @ApiProperty({
        description: 'Tagline',
        example: 'I am a Math teacher with 5 years of experience',
    })
    @IsString()
    @IsOptional()
    tagline: string;

    @ApiProperty({
        description: 'Introduction',
        example: 'I am a Math teacher with 5 years of experience',
    })
    @IsString()
    @IsOptional()
    introduction: string;

    @ApiProperty({
        description: 'Introduction video URL',
        example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
    @IsString()
    @IsOptional()
    introductionVideoUrl: string;

    @ApiProperty({
        description: 'Introduction video thumbnail URL',
        example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
    @IsString()
    @IsOptional()
    introductionVideoThumbnailUrl: string;

    @ApiProperty({
        description: 'Introduction video title',
        example: 'Introduction to Math',
    })
    @IsString()
    @IsOptional()
    introductionVideoTitle: string;

    @ApiProperty({
        description: 'Introduction video description',
        example: 'I am a Math teacher with 5 years of experience',
    })
    @IsString()
    @IsOptional()
    introductionVideoDescription: string;

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
        description: 'Education ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @Type(() => String)
    @IsOptional()
    id?: string;

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