import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Assignment from 'src/database/entities/assignment.entity';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import AssignmentListDto from './dto/assignment-list.dto';
import SubmissionListDto from './dto/submission-list.dto';
import { AssignmentStatus } from 'src/database/entities/assignment.entity';
import { SubmissionStatus } from 'src/database/entities/assignment-submission.entity';
import User from 'src/database/entities/user.entity';

@ApiTags('Assignments')
@Controller('teachers/:teacherId/assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({
    status: 201,
    description: 'Assignment created successfully',
    type: ApiResponseModel<Assignment>,
  })
  async createAssignment(
    @Param('teacherId') teacherId: string,
    @Body() createDto: CreateAssignmentDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<Assignment>> {
    const assignment = await this.assignmentService.createAssignment(teacherId, createDto, req.user);
    return ApiResponseModel.success(assignment, 'Assignment created successfully');
  }

  @Get()
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiQuery({ name: 'status', enum: AssignmentStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: ApiResponseModel<AssignmentListDto>,
  })
  async getAssignments(
    @Param('teacherId') teacherId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('classId') classId?: string,
    @Query('status') status?: AssignmentStatus,
  ): Promise<ApiResponseModel<AssignmentListDto>> {
    const result = await this.assignmentService.getTeacherAssignments(teacherId, req.user, {
      page,
      limit,
      classId,
      status,
    });
    return ApiResponseModel.success(result, 'Assignments retrieved successfully');
  }

  @Get(':assignmentId')
  @ApiResponse({
    status: 200,
    description: 'Assignment retrieved successfully',
    type: ApiResponseModel<Assignment>,
  })
  async getAssignmentById(
    @Param('teacherId') teacherId: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<Assignment>> {
    const assignment = await this.assignmentService.getAssignmentById(assignmentId, req.user);
    return ApiResponseModel.success(assignment, 'Assignment retrieved successfully');
  }

  @Put(':assignmentId')
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
    type: ApiResponseModel<Assignment>,
  })
  async updateAssignment(
    @Param('teacherId') teacherId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() updateDto: UpdateAssignmentDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<Assignment>> {
    const assignment = await this.assignmentService.updateAssignment(assignmentId, updateDto, req.user);
    return ApiResponseModel.success(assignment, 'Assignment updated successfully');
  }

  @Delete(':assignmentId')
  @ApiResponse({
    status: 200,
    description: 'Assignment deleted successfully',
    type: ApiResponseModel<void>,
  })
  async deleteAssignment(
    @Param('teacherId') teacherId: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<void>> {
    await this.assignmentService.deleteAssignment(assignmentId, req.user);
    return ApiResponseModel.success(undefined, 'Assignment deleted successfully');
  }

  @Get(':assignmentId/submissions')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'status', enum: SubmissionStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
    type: ApiResponseModel<SubmissionListDto>,
  })
  async getSubmissions(
    @Param('teacherId') teacherId: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: SubmissionStatus,
  ): Promise<ApiResponseModel<SubmissionListDto>> {
    const result = await this.assignmentService.getSubmissions(assignmentId, req.user, {
      page,
      limit,
      status,
    });
    return ApiResponseModel.success(result, 'Submissions retrieved successfully');
  }

  @Put(':assignmentId/submissions/:submissionId/grade')
  @ApiBody({ type: GradeSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'Submission graded successfully',
    type: ApiResponseModel<AssignmentSubmission>,
  })
  async gradeSubmission(
    @Param('teacherId') teacherId: string,
    @Param('assignmentId') assignmentId: string,
    @Param('submissionId') submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<AssignmentSubmission>> {
    const submission = await this.assignmentService.gradeSubmission(
      assignmentId,
      submissionId,
      gradeDto,
      req.user,
    );
    return ApiResponseModel.success(submission, 'Submission graded successfully');
  }
}

