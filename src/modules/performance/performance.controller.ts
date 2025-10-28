import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Performance from '../../database/entities/performance.entity';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { PerformanceType } from '../shared/enums';

@ApiTags('Performance')
@Controller('performances')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @ApiBody({ type: CreatePerformanceDto })
  @ApiResponse({
    status: 200,
    description: 'Performance record created successfully',
    type: ApiResponseModel,
  })
  async createPerformance(
    @Body() createPerformanceDto: CreatePerformanceDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Performance>> {
    const performance = await this.performanceService.createPerformance(
      createPerformanceDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      performance,
      'Performance record created successfully',
    );
  }

  @Get()
  @ApiQuery({ name: 'type', enum: PerformanceType, required: false })
  @ApiQuery({ name: 'studentId', type: 'string', required: false })
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Performance records retrieved successfully',
    type: ApiResponseModel,
  })
  async getPerformances(
    @Query('type') type?: PerformanceType,
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
  ): Promise<ApiResponseModel<Performance[]>> {
    const performances = await this.performanceService.getPerformances({
      type,
      studentId,
      classId,
    });
    return ApiResponseModel.success(
      performances,
      'Performance records retrieved successfully',
    );
  }

  @Get('my-performance')
  @ApiResponse({
    status: 200,
    description: 'User performance records retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyPerformance(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Performance[]>> {
    const performances = await this.performanceService.getUserPerformance(
      req.user.id,
    );
    return ApiResponseModel.success(
      performances,
      'User performance records retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Performance record retrieved successfully',
    type: ApiResponseModel,
  })
  async getPerformanceById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<Performance>> {
    const performance = await this.performanceService.getPerformanceById(id);
    return ApiResponseModel.success(
      performance,
      'Performance record retrieved successfully',
    );
  }

  @Put(':id')
  @ApiBody({ type: UpdatePerformanceDto })
  @ApiResponse({
    status: 200,
    description: 'Performance record updated successfully',
    type: ApiResponseModel,
  })
  async updatePerformance(
    @Param('id') id: string,
    @Body() updatePerformanceDto: UpdatePerformanceDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Performance>> {
    const performance = await this.performanceService.updatePerformance(
      id,
      updatePerformanceDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      performance,
      'Performance record updated successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Performance record deleted successfully',
    type: ApiResponseModel,
  })
  async deletePerformance(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.performanceService.deletePerformance(id, req.user.id);
    return ApiResponseModel.success(
      undefined,
      'Performance record deleted successfully',
    );
  }

  @Get('statistics/student/:studentId')
  @ApiResponse({
    status: 200,
    description: 'Student performance statistics retrieved successfully',
    type: ApiResponseModel,
  })
  async getStudentStatistics(
    @Param('studentId') studentId: string,
  ): Promise<ApiResponseModel<any>> {
    const statistics =
      await this.performanceService.getStudentStatistics(studentId);
    return ApiResponseModel.success(
      statistics,
      'Student performance statistics retrieved successfully',
    );
  }
}
