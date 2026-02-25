import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export default class AddReviewDto{
    @ApiProperty()
    @IsString()
    teacherBookingId:string;

    @ApiProperty()
    @IsOptional()
    reviewerId?:string;

    @ApiProperty()
    @IsOptional()
    revieweeId?:string;

    @ApiProperty()
    @IsOptional()
    punctuality: number | null;

    @ApiProperty()
    @IsOptional()
    engagement: number | null;

    @ApiProperty()
    @IsOptional()
    knowledge: number | null;

    @ApiProperty()
    @IsOptional()
    communication: number | null;

    @ApiProperty()
    @IsOptional()
    overallExperience: number | null;

    @ApiProperty()
    @IsOptional()
    rating: number | null;

    @ApiProperty()
    @IsOptional()
    comment: string | null;
}