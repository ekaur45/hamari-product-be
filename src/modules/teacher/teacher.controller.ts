import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { TeacherService } from './teacher.service';
import { Teacher } from 'src/database/entities/teacher.entity';
import { ApiResponseModel } from '../shared/models/api-response.model';
import UpdateTeacherRatesDto from './dto/update-rates.dto';
import User from 'src/database/entities/user.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import Subject from 'src/database/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';





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


  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Teacher retrieved successfully',
    type: ApiResponseModel<Teacher>,
  })
  async getTeacherById(@Param('id') id: string): Promise<ApiResponseModel<Teacher>> {
    const teacher = await this.teacherService.getTeacherById(id);
    return ApiResponseModel.success(teacher, 'Teacher retrieved successfully');
  }

  @Put(':teacherId/rates')
  @ApiBody({ type: UpdateTeacherRatesDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher rates updated successfully',
    type: ApiResponseModel<Teacher>,
  })
  async updateTeacherRates(
    @Param('teacherId') teacherId: string, 
    @Body() updateTeacherRatesDto: UpdateTeacherRatesDto,
    @Request() req: { user: User }
  ): Promise<ApiResponseModel<Teacher>> {
    const teacher = await this.teacherService.updateTeacherRates(teacherId, updateTeacherRatesDto,req.user);
    return ApiResponseModel.success(teacher, 'Teacher rates updated successfully');
  }

  @Get(':teacherId/bookings')
  @ApiResponse({
    status: 200,
    description: 'Teacher bookings retrieved successfully',
    type: ApiResponseModel<TeacherBooking[]>,
  })
  async getTeacherBookings(@Request() req: { user: User }): Promise<ApiResponseModel<TeacherBooking[]>> {
    const bookings = await this.teacherService.getTeacherBookings(req.user);
    return ApiResponseModel.success(bookings, 'Teacher bookings retrieved successfully');
  }

  @Get('booking/:bookingId')
  @ApiResponse({
    status: 200,
    description: 'Teacher booking retrieved successfully',
    type: ApiResponseModel<TeacherBooking>,
  })
  async getTeacherBookingById(@Param('bookingId') bookingId: string): Promise<ApiResponseModel<TeacherBooking>> {
    const booking = await this.teacherService.getTeacherBookingById(bookingId);
    return ApiResponseModel.success(booking, 'Teacher booking retrieved successfully');
  }

  @Get(':teacherId/classes')
  @ApiResponse({
    status: 200,
    description: 'Teacher classes retrieved successfully',
    type: ApiResponseModel<ClassEntity[]>,
  })
  async getTeacherClasses(@Request() req: { user: User }): Promise<ApiResponseModel<ClassEntity[]>> {
    const classes = await this.teacherService.getTeacherClasses({...req.user});
    return ApiResponseModel.success(classes, 'Teacher classes retrieved successfully');
  }

  @Get(':teacherId/subjects')
  @ApiResponse({
    status: 200,
    description: 'Teacher subjects retrieved successfully',
    type: ApiResponseModel<Subject[]>,
  })
  async getTeacherSubjects(@Request() req: { user: User }): Promise<ApiResponseModel<Subject[]>> {
    const subjects = await this.teacherService.getTeacherSubjects({...req.user});
    return ApiResponseModel.success(subjects, 'Teacher subjects retrieved successfully');
  }


  @Post(':teacherId/class')
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class created successfully',
    type: ApiResponseModel<ClassEntity>,
  })
  async createClass(@Param('teacherId') teacherId: string, @Body() createClassDto: CreateClassDto): Promise<ApiResponseModel<ClassEntity>> {
    if (teacherId !== createClassDto.teacherId) {
      throw new ForbiddenException('You can only create classes for your own teacher');
    }
    const classEntity = await this.teacherService.createClass(teacherId, createClassDto);
    return ApiResponseModel.success(classEntity, 'Class created successfully');
  }
  @Delete(':teacherId/class/:classId')
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
    type: ApiResponseModel<ClassEntity>,
  })
  async deleteClass(@Param('teacherId') teacherId: string, @Param('classId') classId: string): Promise<ApiResponseModel<ClassEntity>> {
    const classEntity = await this.teacherService.deleteClass(teacherId, classId);
    return ApiResponseModel.success(classEntity, 'Class deleted successfully');
  }

}
