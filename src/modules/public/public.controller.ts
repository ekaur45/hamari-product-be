import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponseModel } from "../shared/models/api-response.model";
import { PublicService } from "./public.service";

@ApiTags('Public')
@Controller('public/api')
export class PublicController {
    constructor(
        private readonly publicService: PublicService,
    ) { }
    @Get('ping')
    ping() {
        return 'pong';
    }
    @Get('subjects')
    async getSubjects() {
        const subjects = await this.publicService.getSubjects();
        return ApiResponseModel.success(subjects);
    }
}