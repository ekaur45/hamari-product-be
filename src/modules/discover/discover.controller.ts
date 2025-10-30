import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiscoverService } from './discover.service';
import { ApiResponseModel } from '../shared/models/api-response.model';

@ApiTags('Discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('')
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Unified discover results', type: ApiResponseModel })
  async search(@Query('q') q?: string) {
    const data = await this.discoverService.search(q || '');
    return ApiResponseModel.success(data, 'Discover results');
  }
}


