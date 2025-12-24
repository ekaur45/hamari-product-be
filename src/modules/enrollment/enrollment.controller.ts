import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';
import User from 'src/database/entities/user.entity';

@ApiTags('Enrollment')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post('class')
  async enrollInClass(@Request() req: { user: User }, @Body('classId') classId: string, @Body('month') month: string) {
    return this.enrollmentService.enrollInClass(req.user, classId, month);
  }

  @Get('my-courses')
  async getMyEnrollments(@Request() req: { user: User }) {
    return this.enrollmentService.getStudentEnrollments(req.user);
  }

  @Get('browse-classes')
  async browseClasses() {
    return this.enrollmentService.browseClasses();
  }

  @Get('browse-teachers')
  async browseTeachers() {
    return this.enrollmentService.browseTeachers();
  }
}
