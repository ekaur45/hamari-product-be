import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { StudentService } from './student.service';
import { StudentScheduleDto } from './dto/student-schedule.dto';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from 'src/database/entities/user.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import Assignment from 'src/database/entities/assignment.entity';
import AssignmentSubmission, { SubmissionStatus } from 'src/database/entities/assignment-submission.entity';
import Review from 'src/database/entities/review.entity';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import StudentAssignmentListDto from './dto/student-assignment-list.dto';
import StudentBookingListDto from './dto/student-booking-list.dto';
import StudentPerformanceDto from '../teacher/dto/student-performance.dto';
import { BookingStatus } from '../shared/enums';


@ApiTags('Student')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) { }


  @Get(':studentId/schedule')
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: ApiResponseModel<StudentScheduleDto[]>,
  })
  async getSchedule(
    @Param('studentId') studentId: string,
    @Request() req: { user: User }
  ): Promise<ApiResponseModel<StudentScheduleDto>> {

    const schedule = await this.studentService.getSchedule(req.user);
    return ApiResponseModel.success(schedule, 'Schedule retrieved successfully');
  }
  @Get(':studentId/classes/bookings')
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
    type: ApiResponseModel<ClassBooking[]>,
  })
  async getClasses(@Param('studentId') studentId: string, @Request() req: { user: User }): Promise<ApiResponseModel<ClassBooking[]>> {
    const classes = await this.studentService.getClasses(req.user);
    return ApiResponseModel.success(classes, 'Classes retrieved successfully');
  }

  // Assignments
  @Get(':studentId/assignments')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: ApiResponseModel<StudentAssignmentListDto>,
  })
  async getAssignments(
    @Param('studentId') studentId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('classId') classId?: string,
  ): Promise<ApiResponseModel<StudentAssignmentListDto>> {
    const result = await this.studentService.getStudentAssignments(req.user, { page, limit, classId });
    return ApiResponseModel.success(result, 'Assignments retrieved successfully');
  }

  @Get(':studentId/assignments/:assignmentId')
  @ApiResponse({
    status: 200,
    description: 'Assignment retrieved successfully',
    type: ApiResponseModel<Assignment>,
  })
  async getAssignmentById(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<Assignment>> {
    const assignment = await this.studentService.getAssignmentById(assignmentId, req.user);
    return ApiResponseModel.success(assignment, 'Assignment retrieved successfully');
  }

  @Post(':studentId/assignments/:assignmentId/submit')
  @ApiBody({ type: SubmitAssignmentDto })
  @ApiResponse({
    status: 201,
    description: 'Assignment submitted successfully',
    type: ApiResponseModel<AssignmentSubmission>,
  })
  async submitAssignment(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<AssignmentSubmission>> {
    const submission = await this.studentService.submitAssignment(assignmentId, submitDto, req.user);
    return ApiResponseModel.success(submission, 'Assignment submitted successfully');
  }

  @Get(':studentId/submissions')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'assignmentId', type: 'string', required: false })
  @ApiQuery({ name: 'status', enum: SubmissionStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
    type: ApiResponseModel<{ submissions: AssignmentSubmission[]; total: number; pagination: any }>,
  })
  async getMySubmissions(
    @Param('studentId') studentId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('assignmentId') assignmentId?: string,
    @Query('status') status?: SubmissionStatus,
  ): Promise<ApiResponseModel<{ submissions: AssignmentSubmission[]; total: number; pagination: any }>> {
    const result = await this.studentService.getMySubmissions(req.user, { page, limit, assignmentId, status });
    return ApiResponseModel.success(result, 'Submissions retrieved successfully');
  }

  // Bookings
  @Get(':studentId/bookings')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: ApiResponseModel<StudentBookingListDto>,
  })
  async getMyBookings(
    @Param('studentId') studentId: string,
    @Request() req: { user: User },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: BookingStatus,
  ): Promise<ApiResponseModel<StudentBookingListDto>> {
    const result = await this.studentService.getMyBookings(req.user, { page, limit, status });
    return ApiResponseModel.success(result, 'Bookings retrieved successfully');
  }

  @Put(':studentId/bookings/:bookingId/cancel')
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: ApiResponseModel<void>,
  })
  async cancelBooking(
    @Param('studentId') studentId: string,
    @Param('bookingId') bookingId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<void>> {
    await this.studentService.cancelBooking(bookingId, req.user);
    return ApiResponseModel.success(undefined, 'Booking cancelled successfully');
  }

  // Classes
  @Get(':studentId/classes/:classId')
  @ApiResponse({
    status: 200,
    description: 'Class details retrieved successfully',
    type: ApiResponseModel<ClassEntity>,
  })
  async getClassDetails(
    @Param('studentId') studentId: string,
    @Param('classId') classId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<ClassEntity>> {
    const classEntity = await this.studentService.getClassDetails(classId, req.user);
    return ApiResponseModel.success(classEntity, 'Class details retrieved successfully');
  }

  // Reviews
  @Post(':studentId/reviews/teachers/:teacherId')
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ApiResponseModel<Review>,
  })
  async createReview(
    @Param('studentId') studentId: string,
    @Param('teacherId') teacherId: string,
    @Body() createDto: CreateReviewDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<Review>> {
    const review = await this.studentService.createReview(teacherId, createDto, req.user);
    return ApiResponseModel.success(review, 'Review created successfully');
  }

  @Get(':studentId/reviews/teachers/:teacherId')
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Teacher reviews retrieved successfully',
    type: ApiResponseModel<{ reviews: Review[]; pagination: any }>,
  })
  async getTeacherReviews(
    @Param('studentId') studentId: string,
    @Param('teacherId') teacherId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseModel<{ reviews: Review[]; pagination: any }>> {
    const result = await this.studentService.getTeacherReviews(teacherId, page, limit);
    return ApiResponseModel.success(result, 'Teacher reviews retrieved successfully');
  }

  // Performance
  @Get(':studentId/performance')
  @ApiResponse({
    status: 200,
    description: 'Performance retrieved successfully',
    type: ApiResponseModel<StudentPerformanceDto>,
  })
  async getMyPerformance(
    @Param('studentId') studentId: string,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<StudentPerformanceDto>> {
    const performance = await this.studentService.getMyPerformance(req.user);
    return ApiResponseModel.success(performance, 'Performance retrieved successfully');
  }
}

