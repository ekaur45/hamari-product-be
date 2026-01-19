import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCurrencyDto {
    @ApiProperty({ description: 'Currency code', example: 'USD' })
    @IsNotEmpty({ message: 'Currency code is required' })
    @IsString({ message: 'Currency code must be a string' })
    code: string;

    @ApiProperty({ description: 'Currency name', example: 'United States Dollar' })
    @IsNotEmpty({ message: 'Currency name is required' })
    @IsString({ message: 'Currency name must be a string' })
    name: string;

    @ApiProperty({ description: 'Currency symbol', example: '$' })
    @IsNotEmpty({ message: 'Currency symbol is required' })
    @IsString({ message: 'Currency symbol must be a string' })
    symbol: string;

    @ApiProperty({ description: 'Currency exchange rate', example: 1.0 })
    @IsNotEmpty({ message: 'Currency exchange rate is required' })
    @IsNumber({}, { message: 'Currency exchange rate must be a number' })
    exchangeRate: number;

    @ApiProperty({ description: 'Is base currency', example: true })
    @IsNotEmpty({ message: 'Is base currency is required' })
    @IsBoolean({ message: 'Is base currency must be a boolean' })
    isBase: boolean;
}