import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsNotEmpty, Min } from "class-validator";

export default class UpdateSubjectRatesDto {
    @ApiProperty({
        description: 'Subject ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsString({ message: 'Subject ID must be a string' })
    @IsNotEmpty()
    id: string;
    @ApiProperty({
        description: 'Hourly rate',
        example: 100,
        required: true,
    })
    @IsNumber({}, { message: 'Hourly rate must be a number' })
    hourlyRate: number;
    @ApiProperty({
        description: 'Monthly rate',
        example: 1000,
        required: true,
    })
    @IsNumber({}, { message: 'Monthly rate must be a number' })
    @Min(0, { message: 'Monthly rate cannot be negative' })
    monthlyRate: number;
}