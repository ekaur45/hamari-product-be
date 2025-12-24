import { Controller, Get, Query, SetMetadata, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/modules/shared/enums';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { JwtAuthGuard } from 'src/modules/shared/guards/jwt-auth.guard';
import { AdminTeachersService } from './admin-teachers.service';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import TeacherListDto from './dto/teacher-list.dti';
import TeacherUpdateStatusDto from './dto/teacher-update-status.dto';
import TeacherUpdateVerificationDto from './dto/teacher-update-verification.dto';
import TeacherUpdateDeletionDto from './dto/teacher-update-deletion.dto';
import { Body, Param, Patch } from '@nestjs/common';
import { Teacher } from 'src/database/entities/teacher.entity';
import { AdminActionLoggerInterceptor } from '../../shared/interceptors/admin-action-logger.interceptor';

@ApiTags('Teachers')
@Controller('admin/teachers')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class TeachersController {
    constructor(private readonly adminTeachersService: AdminTeachersService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'isActive', type: 'boolean', required: false })
    @ApiQuery({ name: 'isVerified', type: 'boolean', required: false })
    @ApiResponse({
        status: 200,
        description: 'Teachers retrieved successfully',
        type: ApiResponseModel,
    })
    async getTeachers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('isActive') isActive?: boolean,
        @Query('isVerified') isVerified?: boolean,
    ): Promise<ApiResponseModel<TeacherListDto>> {
        const teachers = await this.adminTeachersService.getTeachers({ page, limit, search, isActive, isVerified });
        return ApiResponseModel.success(teachers, 'Teachers retrieved successfully');
    }

    @Patch(':id/status')
    @ApiBody({ type: TeacherUpdateStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Teacher status updated successfully',
        type: ApiResponseModel,
    })
    async updateTeacherStatus(
        @Param('id') id: string,
        @Body() payload: TeacherUpdateStatusDto,
    ): Promise<ApiResponseModel<Teacher>> {
        const teacher = await this.adminTeachersService.updateTeacherStatus(id, payload);
        return ApiResponseModel.success(teacher, 'Teacher status updated successfully');
    }

    @Patch(':id/verification')
    @ApiBody({ type: TeacherUpdateVerificationDto })
    @ApiResponse({
        status: 200,
        description: 'Teacher verification updated successfully',
        type: ApiResponseModel,
    })
    async updateTeacherVerification(
        @Param('id') id: string,
        @Body() payload: TeacherUpdateVerificationDto,
        @Req() req: any,
    ): Promise<ApiResponseModel<Teacher>> {
        const teacher = await this.adminTeachersService.updateTeacherVerification(id, payload, req.user?.id);
        return ApiResponseModel.success(teacher, 'Teacher verification updated successfully');
    }

    @Patch(':id/deletion')
    @ApiBody({ type: TeacherUpdateDeletionDto })
    @ApiResponse({
        status: 200,
        description: 'Teacher deletion flag updated successfully',
        type: ApiResponseModel,
    })
    async updateTeacherDeletion(
        @Param('id') id: string,
        @Body() payload: TeacherUpdateDeletionDto,
    ): Promise<ApiResponseModel<Teacher>> {
        const teacher = await this.adminTeachersService.updateTeacherDeletion(id, payload);
        return ApiResponseModel.success(teacher, 'Teacher deletion flag updated successfully');
    }
}
