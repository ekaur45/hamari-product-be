import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ParentService } from './parent.service';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from 'src/database/entities/user.entity';
import { ChildClassesDto, ChildAssignmentsDto, ChildScheduleDto, ChildBookingsDto, ChildPerformanceDto } from './dto/child-data.dto';

@ApiTags('Parent')
@Controller('parents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children/:childId/classes')
  @ApiResponse({
    status: 200,
    description: 'Child classes retrieved successfully',
    type: ApiResponseModel<ChildClassesDto>,
  })
  async getChildClasses(
    @Param('childId') childId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<ChildClassesDto>> {
    const result = await this.parentService.getChildClasses(req.user, childId);
    return ApiResponseModel.success(result, 'Child classes retrieved successfully');
  }

  @Get('children/:childId/assignments')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Child assignments retrieved successfully',
    type: ApiResponseModel<ChildAssignmentsDto>,
  })
  async getChildAssignments(
    @Param('childId') childId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseModel<ChildAssignmentsDto>> {
    const result = await this.parentService.getChildAssignments(req.user, childId, page, limit);
    return ApiResponseModel.success(result, 'Child assignments retrieved successfully');
  }

  @Get('children/:childId/schedule')
  @ApiResponse({
    status: 200,
    description: 'Child schedule retrieved successfully',
    type: ApiResponseModel<ChildScheduleDto>,
  })
  async getChildSchedule(
    @Param('childId') childId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<ChildScheduleDto>> {
    const result = await this.parentService.getChildSchedule(req.user, childId);
    return ApiResponseModel.success(result, 'Child schedule retrieved successfully');
  }

  @Get('children/:childId/bookings')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Child bookings retrieved successfully',
    type: ApiResponseModel<ChildBookingsDto>,
  })
  async getChildBookings(
    @Param('childId') childId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseModel<ChildBookingsDto>> {
    const result = await this.parentService.getChildBookings(req.user, childId, page, limit);
    return ApiResponseModel.success(result, 'Child bookings retrieved successfully');
  }

  @Get('children/:childId/performance')
  @ApiResponse({
    status: 200,
    description: 'Child performance retrieved successfully',
    type: ApiResponseModel<ChildPerformanceDto>,
  })
  async getChildPerformance(
    @Param('childId') childId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<ChildPerformanceDto>> {
    const result = await this.parentService.getChildPerformance(req.user, childId);
    return ApiResponseModel.success(result, 'Child performance retrieved successfully');
  }
}

