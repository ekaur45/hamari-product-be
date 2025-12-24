import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';
import User from 'src/database/entities/user.entity';

@ApiTags('Enrollment')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('class')
  async enrollInClass(@Request() req: { user: User }, @Body('classId') classId: string, @Body('month') month: string) {
    return this.enrollmentService.enrollInClass(req.user, classId, month);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-courses')
  async getMyEnrollments(@Request() req: { user: User }) {
    return this.enrollmentService.getStudentEnrollments(req.user);
  }

  @Get('browse-classes')
  async browseClasses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('subject') subject?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.enrollmentService.browseClasses(page, limit, { search, subject, maxPrice });
  }

  @Get('browse-teachers')
  async browseTeachers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('subject') subject?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.enrollmentService.browseTeachers(page, limit, { search, subject, maxPrice });
  }
}
