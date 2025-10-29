import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { CreateTeacherDirectDto } from './dto/create-teacher-direct.dto';
import { ClassType, ClassStatus, PerformanceType } from '../shared/enums';
import AcademyTeacher from 'src/database/entities/academy-teacher.entity';
import User from 'src/database/entities/user.entity';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

class UpsertTeacherSubjectDto {
  @IsUUID('4')
  subjectId: string;
  @IsOptional()
  @IsNumber()
  fee?: number;
}

class UpdateTeacherSubjectDto {
  @IsOptional()
  @IsNumber()
  fee?: number;
}



@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}



  @Get('')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
    type: ApiResponseModel,
  })
  async getTeachers(
    @Request() req: { user: User },
    @Query('page') page: number=1,
    @Query('limit') limit: number=10,
    @Query('search') search?: string,
  ): Promise<ApiResponseModel<AcademyTeacher[]>> {
    const {data, total} = await this.teacherService.getTeachers(req.user,page, limit, search);
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
    return ApiResponseModel.successWithPagination(data, pagination, 'Teachers retrieved successfully');
  }


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

  // Teacher subjects (what they can teach) with optional fee per subject
  @Get('my-subjects')
  async getMySubjects(@Request() req: { user: { id: string } }) {
    const data = await this.teacherService.getMySubjects(req.user.id);
    return ApiResponseModel.success(data, 'Subjects retrieved successfully');
  }

  @Post('my-subjects')
  @ApiBody({ type: UpsertTeacherSubjectDto })
  async addMySubject(@Request() req: { user: { id: string } }, @Body() body: UpsertTeacherSubjectDto) {
    const created = await this.teacherService.addMySubject(req.user.id, body);
    return ApiResponseModel.success(created, 'Subject added');
  }

  @Put('my-subjects/:id')
  @ApiBody({ type: UpdateTeacherSubjectDto })
  async updateMySubject(@Request() req: { user: { id: string } }, @Param('id') id: string, @Body() body: UpdateTeacherSubjectDto) {
    const updated = await this.teacherService.updateMySubject(req.user.id, id, body);
    return ApiResponseModel.success(updated, 'Subject updated');
  }

  @Delete('my-subjects/:id')
  async removeMySubject(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    await this.teacherService.removeMySubject(req.user.id, id);
    return ApiResponseModel.success(true, 'Subject removed');
  }

  @Post()
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({
    status: 201,
    description: 'Teacher created successfully',
    type: ApiResponseModel,
  })
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
  ): Promise<ApiResponseModel<any>> {
    const teacher = await this.teacherService.createTeacher(createTeacherDto);
    return ApiResponseModel.success(teacher, 'Teacher created successfully');
  }

  @Post('direct')
  @ApiBody({ type: CreateTeacherDirectDto })
  @ApiResponse({
    status: 201,
    description: 'Teacher created directly and assigned to academy',
    type: ApiResponseModel,
  })
  async createTeacherDirect(
    @Body() createTeacherDirectDto: CreateTeacherDirectDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<{ user: User; academyTeacher: AcademyTeacher }>> {
    const result = await this.teacherService.createTeacherDirect(
      createTeacherDirectDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      result,
      'Teacher created and assigned to academy successfully',
    );
  }

  @Get('academy/:academyId')
  @ApiResponse({
    status: 200,
    description: 'Academy teachers retrieved successfully',
    type: ApiResponseModel,
  })
  async getAcademyTeachers(
    @Param('academyId') academyId: string,
  ): Promise<ApiResponseModel<any[]>> {
    const teachers = await this.teacherService.getAcademyTeachers(academyId);
    return ApiResponseModel.success(teachers, 'Academy teachers retrieved successfully');
  }

  @Get('academy/:academyId/teacher/:teacherId')
  @ApiResponse({
    status: 200,
    description: 'Teacher details retrieved successfully',
    type: ApiResponseModel,
  })
  async getTeacherByAcademy(
    @Param('academyId') academyId: string,
    @Param('teacherId') teacherId: string,
  ): Promise<ApiResponseModel<any>> {
    const teacher = await this.teacherService.getTeacherByAcademy(academyId, teacherId);
    return ApiResponseModel.success(teacher, 'Teacher details retrieved successfully');
  }

  @Put('academy/:academyId/teacher/:teacherId')
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher updated successfully',
    type: ApiResponseModel,
  })
  async updateTeacher(
    @Param('academyId') academyId: string,
    @Param('teacherId') teacherId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<ApiResponseModel<any>> {
    const teacher = await this.teacherService.updateTeacher(academyId, teacherId, updateTeacherDto);
    return ApiResponseModel.success(teacher, 'Teacher updated successfully');
  }

  @Delete('academy/:academyId/teacher/:teacherId')
  @ApiResponse({
    status: 200,
    description: 'Teacher removed from academy successfully',
    type: ApiResponseModel,
  })
  async removeTeacherFromAcademy(
    @Param('academyId') academyId: string,
    @Param('teacherId') teacherId: string,
  ): Promise<ApiResponseModel<void>> {
    await this.teacherService.removeTeacherFromAcademy(academyId, teacherId);
    return ApiResponseModel.success(undefined, 'Teacher removed from academy successfully');
  }
}
