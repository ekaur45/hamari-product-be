import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { StudentService } from './student.service';
import { ClassType, ClassStatus } from '../shared/enums';

@ApiTags('Student')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('my-classes')
  @ApiQuery({ name: 'type', enum: ClassType, required: false })
  @ApiQuery({ name: 'status', enum: ClassStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Student classes retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyClasses(
    @Request() req: { user: { id: string } },
    @Query('type') type?: ClassType,
    @Query('status') status?: ClassStatus,
  ): Promise<ApiResponseModel<any[]>> {
    const classes = await this.studentService.getStudentClasses(req.user.id, {
      type,
      status,
    });
    return ApiResponseModel.success(classes, 'Student classes retrieved successfully');
  }

  @Get('my-enrollments')
  @ApiResponse({
    status: 200,
    description: 'Student enrollments retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyEnrollments(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const enrollments = await this.studentService.getStudentEnrollments(req.user.id);
    return ApiResponseModel.success(enrollments, 'Student enrollments retrieved successfully');
  }

  @Get('my-performance')
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Student performance retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyPerformance(
    @Request() req: { user: { id: string } },
    @Query('classId') classId?: string,
  ): Promise<ApiResponseModel<any[]>> {
    const performance = await this.studentService.getStudentPerformance(req.user.id, classId);
    return ApiResponseModel.success(performance, 'Student performance retrieved successfully');
  }

  @Get('my-payments')
  @ApiResponse({
    status: 200,
    description: 'Student payments retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyPayments(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const payments = await this.studentService.getStudentPayments(req.user.id);
    return ApiResponseModel.success(payments, 'Student payments retrieved successfully');
  }

  @Get('dashboard')
  @ApiResponse({
    status: 200,
    description: 'Student dashboard data retrieved successfully',
    type: ApiResponseModel,
  })
  async getDashboard(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const dashboard = await this.studentService.getStudentDashboard(req.user.id);
    return ApiResponseModel.success(dashboard, 'Student dashboard data retrieved successfully');
  }

  @Get('statistics')
  @ApiResponse({
    status: 200,
    description: 'Student statistics retrieved successfully',
    type: ApiResponseModel,
  })
  async getStatistics(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const statistics = await this.studentService.getStudentStatistics(req.user.id);
    return ApiResponseModel.success(statistics, 'Student statistics retrieved successfully');
  }

  @Post('enroll/:classId')
  @ApiResponse({
    status: 200,
    description: 'Student enrolled in class successfully',
    type: ApiResponseModel,
  })
  async enrollInClass(
    @Param('classId') classId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const enrollment = await this.studentService.enrollInClass(req.user.id, classId);
    return ApiResponseModel.success(enrollment, 'Student enrolled in class successfully');
  }

  @Post('unenroll/:enrollmentId')
  @ApiResponse({
    status: 200,
    description: 'Student unenrolled from class successfully',
    type: ApiResponseModel,
  })
  async unenrollFromClass(
    @Param('enrollmentId') enrollmentId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.studentService.unenrollFromClass(req.user.id, enrollmentId);
    return ApiResponseModel.success(undefined, 'Student unenrolled from class successfully');
  }

  @Post('book-teacher')
  @ApiBody({ schema: { properties: { teacherId: { type: 'string' }, date: { type: 'string', example: '2025-10-30' }, startTime: { type: 'string', example: '10:00' }, endTime: { type: 'string', example: '11:00' }, subject: { type: 'string' } }, required: ['teacherId', 'date', 'startTime', 'endTime'] } })
  @ApiResponse({ status: 200, description: 'Teacher booked successfully', type: ApiResponseModel })
  async bookTeacher(
    @Body() body: { teacherId: string; date: string; startTime: string; endTime: string; subject?: string },
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const result = await this.studentService.bookTeacher(req.user.id, body);
    return ApiResponseModel.success(result, 'Teacher booked successfully');
  }
}

