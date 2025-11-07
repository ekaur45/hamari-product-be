import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export default class UpdateTeacherRatesDto {
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