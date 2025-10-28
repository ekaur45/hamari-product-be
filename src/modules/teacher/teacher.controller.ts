import {
  Body,
  Controller,
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
import { TeacherService } from './teacher.service';
import { CreatePerformanceDto } from '../performance/dto/create-performance.dto';
import { UpdatePerformanceDto } from '../performance/dto/update-performance.dto';
import { ClassType, ClassStatus, PerformanceType } from '../shared/enums';

@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('my-classes')
  @ApiQuery({ name: 'type', enum: ClassType, required: false })
  @ApiQuery({ name: 'status', enum: ClassStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Teacher classes retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyClasses(
    @Request() req: { user: { id: string } },
    @Query('type') type?: ClassType,
    @Query('status') status?: ClassStatus,
  ): Promise<ApiResponseModel<any[]>> {
    const classes = await this.teacherService.getTeacherClasses(req.user.id, {
      type,
      status,
    });
    return ApiResponseModel.success(classes, 'Teacher classes retrieved successfully');
  }

  @Get('my-students')
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Teacher students retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyStudents(
    @Request() req: { user: { id: string } },
    @Query('classId') classId?: string,
  ): Promise<ApiResponseModel<any[]>> {
    const students = await this.teacherService.getTeacherStudents(req.user.id, classId);
    return ApiResponseModel.success(students, 'Teacher students retrieved successfully');
  }

  @Get('my-academies')
  @ApiResponse({
    status: 200,
    description: 'Teacher academies retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyAcademies(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const academies = await this.teacherService.getTeacherAcademies(req.user.id);
    return ApiResponseModel.success(academies, 'Teacher academies retrieved successfully');
  }

  @Get('my-invitations')
  @ApiResponse({
    status: 200,
    description: 'Teacher invitations retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyInvitations(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const invitations = await this.teacherService.getTeacherInvitations(req.user.id);
    return ApiResponseModel.success(invitations, 'Teacher invitations retrieved successfully');
  }

  @Get('dashboard')
  @ApiResponse({
    status: 200,
    description: 'Teacher dashboard data retrieved successfully',
    type: ApiResponseModel,
  })
  async getDashboard(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const dashboard = await this.teacherService.getTeacherDashboard(req.user.id);
    return ApiResponseModel.success(dashboard, 'Teacher dashboard data retrieved successfully');
  }

  @Get('statistics')
  @ApiResponse({
    status: 200,
    description: 'Teacher statistics retrieved successfully',
    type: ApiResponseModel,
  })
  async getStatistics(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const statistics = await this.teacherService.getTeacherStatistics(req.user.id);
    return ApiResponseModel.success(statistics, 'Teacher statistics retrieved successfully');
  }

  @Post('performance')
  @ApiBody({ type: CreatePerformanceDto })
  @ApiResponse({
    status: 200,
    description: 'Performance record created successfully',
    type: ApiResponseModel,
  })
  async createPerformance(
    @Body() createPerformanceDto: CreatePerformanceDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const performance = await this.teacherService.createPerformance(
      createPerformanceDto,
      req.user.id,
    );
    return ApiResponseModel.success(performance, 'Performance record created successfully');
  }

  @Put('performance/:id')
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
  ): Promise<ApiResponseModel<any>> {
    const performance = await this.teacherService.updatePerformance(
      id,
      updatePerformanceDto,
      req.user.id,
    );
    return ApiResponseModel.success(performance, 'Performance record updated successfully');
  }

  @Get('performance/:studentId')
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiQuery({ name: 'type', enum: PerformanceType, required: false })
  @ApiResponse({
    status: 200,
    description: 'Student performance retrieved successfully',
    type: ApiResponseModel,
  })
  async getStudentPerformance(
    @Param('studentId') studentId: string,
    @Request() req: { user: { id: string } },
    @Query('classId') classId?: string,
    @Query('type') type?: PerformanceType,
  ): Promise<ApiResponseModel<any[]>> {
    const performance = await this.teacherService.getStudentPerformance(
      studentId,
      req.user.id,
      { classId, type },
    );
    return ApiResponseModel.success(performance, 'Student performance retrieved successfully');
  }

  @Get('class/:classId/students')
  @ApiResponse({
    status: 200,
    description: 'Class students retrieved successfully',
    type: ApiResponseModel,
  })
  async getClassStudents(
    @Param('classId') classId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const students = await this.teacherService.getClassStudents(classId, req.user.id);
    return ApiResponseModel.success(students, 'Class students retrieved successfully');
  }

  @Post('class/:classId/start')
  @ApiResponse({
    status: 200,
    description: 'Class started successfully',
    type: ApiResponseModel,
  })
  async startClass(
    @Param('classId') classId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const classEntity = await this.teacherService.startClass(classId, req.user.id);
    return ApiResponseModel.success(classEntity, 'Class started successfully');
  }

  @Post('class/:classId/complete')
  @ApiResponse({
    status: 200,
    description: 'Class completed successfully',
    type: ApiResponseModel,
  })
  async completeClass(
    @Param('classId') classId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const classEntity = await this.teacherService.completeClass(classId, req.user.id);
    return ApiResponseModel.success(classEntity, 'Class completed successfully');
  }
}
