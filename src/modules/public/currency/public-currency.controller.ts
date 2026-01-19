import { Controller, Get } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import Currency from "src/database/entities/currency.entity";
import { CurrencyService } from "src/modules/shared/currency/currency.service";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";

@Controller('public/api/currencies')
export class PublicCurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}
    @Get('list')
    @ApiResponse({
        status: 200,
        description: 'Currencies fetched successfully',
        type: ApiResponseModel<Currency[]>,
    })
    async list(): Promise<ApiResponseModel<Currency[]>> {
        const currencies = await this.currencyService.getPublicCurrencies();
        return ApiResponseModel.success(currencies, 'Currencies fetched successfully');
    }
}