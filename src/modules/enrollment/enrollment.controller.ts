import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';

@ApiTags('Enrollment')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

}
