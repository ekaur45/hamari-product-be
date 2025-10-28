import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@ApiTags('Enrollment')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiResponse({
    status: 200,
    description: 'Enrollment created successfully',
    type: ApiResponseModel,
  })
  async createEnrollment(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ClassEnrollment>> {
    const enrollment = await this.enrollmentService.createEnrollment(
      createEnrollmentDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      enrollment,
      'Enrollment created successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
    type: ApiResponseModel,
  })
  async getEnrollments(): Promise<ApiResponseModel<ClassEnrollment[]>> {
    const enrollments = await this.enrollmentService.getEnrollments();
    return ApiResponseModel.success(
      enrollments,
      'Enrollments retrieved successfully',
    );
  }

  @Get('my-enrollments')
  @ApiResponse({
    status: 200,
    description: 'User enrollments retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyEnrollments(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ClassEnrollment[]>> {
    const enrollments = await this.enrollmentService.getUserEnrollments(
      req.user.id,
    );
    return ApiResponseModel.success(
      enrollments,
      'User enrollments retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Enrollment retrieved successfully',
    type: ApiResponseModel,
  })
  async getEnrollmentById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<ClassEnrollment>> {
    const enrollment = await this.enrollmentService.getEnrollmentById(id);
    return ApiResponseModel.success(
      enrollment,
      'Enrollment retrieved successfully',
    );
  }

  @Put(':id')
  @ApiBody({ type: UpdateEnrollmentDto })
  @ApiResponse({
    status: 200,
    description: 'Enrollment updated successfully',
    type: ApiResponseModel,
  })
  async updateEnrollment(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ClassEnrollment>> {
    const enrollment = await this.enrollmentService.updateEnrollment(
      id,
      updateEnrollmentDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      enrollment,
      'Enrollment updated successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Enrollment cancelled successfully',
    type: ApiResponseModel,
  })
  async cancelEnrollment(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.enrollmentService.cancelEnrollment(id, req.user.id);
    return ApiResponseModel.success(
      undefined,
      'Enrollment cancelled successfully',
    );
  }

  @Post(':id/confirm')
  @ApiResponse({
    status: 200,
    description: 'Enrollment confirmed successfully',
    type: ApiResponseModel,
  })
  async confirmEnrollment(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ClassEnrollment>> {
    const enrollment = await this.enrollmentService.confirmEnrollment(
      id,
      req.user.id,
    );
    return ApiResponseModel.success(
      enrollment,
      'Enrollment confirmed successfully',
    );
  }
}
