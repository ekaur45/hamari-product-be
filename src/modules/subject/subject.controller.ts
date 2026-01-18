import { Body, Controller, Get, Param, Put, Query, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SubjectService } from './subject.service';
import { ApiResponseModel, Pagination } from '../shared/models/api-response.model';
import Subject from 'src/database/entities/subject.entity';
import UpdateSubjectRatesDto from './dto/update-subject-rates.dto';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';
import User from 'src/database/entities/user.entity';
import { GetSubjectRequest } from './dto/get-subject.request';
import { RoleGuard } from '../shared/guards/role.guard';
import { UserRole } from '../shared/enums';


@ApiTags('Subject')
@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }


  @Get()
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    type: ApiResponseModel<Subject[]>,
  })
  async getSubjects(
    @Query('search') name: string,

  ): Promise<ApiResponseModel<Subject[]>> {
    const subjects = await this.subjectService.getSubjects({ name });
    return ApiResponseModel.success(subjects, 'Subjects retrieved successfully');
  }
  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    type: ApiResponseModel<Subject[]>,
  })
  @UseGuards(RoleGuard)
  @SetMetadata('user_roles', [[UserRole.ADMIN]])
  async getAllSubjects(
    @Query() query: GetSubjectRequest,
  ): Promise<ApiResponseModel<{ data: Subject[], pagination: Pagination }>> {
    const subjects = await this.subjectService.getAllSubjects(query);
    return ApiResponseModel.success(subjects, 'Subjects retrieved successfully');
  }
  @Get('search')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    type: ApiResponseModel<Subject[]>,
  })
  async getSubjectsWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') name: string,
  ): Promise<ApiResponseModel<Subject[]>> {
    const { subjects, pagination } = await this.subjectService.getSubjectsWithPagination(page, limit, name);
    return ApiResponseModel.successWithPagination(subjects, pagination, 'Subjects retrieved successfully');
  }

  @Get(':id/details')
  @ApiResponse({
    status: 200,
    description: 'Subject details retrieved successfully',
    type: ApiResponseModel<Subject>,
  })
  async getSubjectDetails(@Param('id') id: string): Promise<ApiResponseModel<Subject>> {
    const subject = await this.subjectService.getSubjectById(id);
    return ApiResponseModel.success(subject, 'Subject details retrieved successfully');
  }

  @Put('rates')
  @ApiBody({ type: Array<UpdateSubjectRatesDto> })
  @ApiResponse({
    status: 200,
    description: 'Subject rates updated successfully',
    type: ApiResponseModel<TeacherSubject[]>,
  })
  async updateSubjectRates(@Body() updateSubjectRatesDto: Array<UpdateSubjectRatesDto>, @Request() req: { user: User }): Promise<ApiResponseModel<TeacherSubject[]>> {
    const teacherSubjects = await this.subjectService.updateSubjectRates(updateSubjectRatesDto, req.user);
    return ApiResponseModel.success(teacherSubjects, 'Subject rates updated successfully');
  }


}


