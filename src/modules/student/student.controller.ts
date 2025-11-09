import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { StudentService } from './student.service';
import { StudentScheduleDto } from './dto/student-schedule.dto';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from 'src/database/entities/user.entity';


@ApiTags('Student')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}


  @Get(':studentId/schedule')
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: ApiResponseModel<StudentScheduleDto[]>,
  })
  async getSchedule(
    @Param('studentId') studentId: string,
    @Request() req: { user: User }
  ): Promise<ApiResponseModel<StudentScheduleDto[]>> {
    
    const schedule = await this.studentService.getSchedule(req.user);
    return ApiResponseModel.success(schedule, 'Schedule retrieved successfully');
  }

}

