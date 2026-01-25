import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Transform, Type } from "class-transformer";

export class PaginationRequest {
    @ApiProperty({ default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    page: number = 1;

    @ApiProperty({ default: 10, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    limit: number = 10;

    @ApiProperty({ required: false, default: '' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim() ?? '')
    search?: string;

    @ApiProperty({ required: false, default: '' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim() ?? '')
    subjects?: string;
}