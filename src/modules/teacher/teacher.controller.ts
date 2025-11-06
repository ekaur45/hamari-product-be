import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { TeacherService } from './teacher.service';
import { Teacher } from 'src/database/entities/teacher.entity';
import { ApiResponseModel } from '../shared/models/api-response.model';





@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('search')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: ApiResponseModel<Teacher[]>,
  })
  async getTeachersWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<ApiResponseModel<Teacher[]>> {
    const { teachers, pagination } = await this.teacherService.getTeachersWithPagination(page, limit, search);
    return ApiResponseModel.successWithPagination(teachers, pagination, 'Teachers retrieved successfully');
  }
}
