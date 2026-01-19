import { Body, Controller, Get, Post, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard";
import { CurrencyService } from "../shared/currency/currency.service";
import { ApiResponseModel } from "../shared/models/api-response.model";
import Currency from "src/database/entities/currency.entity";
import { CreateCurrencyDto } from "./dto/create-currency.dto";
import { RoleGuard } from "../shared/guards/role.guard";
import { UserRole } from "../shared/enums";

@ApiTags('Currency')
@Controller('currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}
    @Get('list')
    @ApiResponse({
        status: 200,
        description: 'Currencies fetched successfully',
        type: ApiResponseModel<Currency[]>,
    })
    async list(): Promise<ApiResponseModel<Currency[]>> {
        const currencies = await this.currencyService.list();
        return ApiResponseModel.success(currencies, 'Currencies fetched successfully');
    }

    @Post('create')
    @ApiBody({ type: CreateCurrencyDto })
    @ApiResponse({
        status: 200,
        description: 'Currency created successfully',
        type: ApiResponseModel<Currency>,
    })
    @UseGuards(RoleGuard)
    @SetMetadata('user_roles', [UserRole.ADMIN])
    async create(@Body() createCurrencyDto: CreateCurrencyDto): Promise<ApiResponseModel<Currency>> {
        const currency = await this.currencyService.createCurrencyByAdmin(createCurrencyDto);
        return ApiResponseModel.success(currency, 'Currency created successfully');
    }
}