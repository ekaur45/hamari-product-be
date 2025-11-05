import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}


