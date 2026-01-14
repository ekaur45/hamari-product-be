import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard";
import { NationalityService } from "./nationality.service";
import { ApiResponseModel } from "../shared/models/api-response.model";
import Nationality from "src/database/entities/nationality.entity";

@ApiTags('Nationality')
@Controller('nationalities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NationalityController {
    constructor(private readonly nationalityService: NationalityService) {}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Nationalities fetched successfully',
        type: ApiResponseModel<Nationality[]>,
    })
    async getNationalities(): Promise<ApiResponseModel<Nationality[]>> {
        const nationalities = await this.nationalityService.getNationalities();
        return ApiResponseModel.success(nationalities, 'Nationalities fetched successfully');
    }
}