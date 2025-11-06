import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SubjectService } from './subject.service';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Subject from 'src/database/entities/subject.entity';


@ApiTags('Subject')
@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}


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
}


