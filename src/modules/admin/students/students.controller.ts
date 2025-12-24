import { Body, Controller, Get, Param, Patch, Query, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminStudentsService } from './admin-students.service';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import StudentListDto from './dto/student-list.dto';
import { JwtAuthGuard } from 'src/modules/shared/guards/jwt-auth.guard';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { UserRole } from 'src/modules/shared/enums';
import StudentUpdateStatusDto from './dto/student-update-status.dto';
import { Student } from 'src/database/entities/student.entity';
import StudentUpdateDeletionDto from './dto/student-update-deletion.dto';
import { AdminActionLoggerInterceptor } from '../../shared/interceptors/admin-action-logger.interceptor';

@Controller('admin/students')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class StudentsController {
    constructor(private readonly adminStudentsService: AdminStudentsService) {}


    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'isActive', type: 'boolean', required: false })
    @ApiResponse({
        status: 200,
        description: 'Students retrieved successfully',
        type: ApiResponseModel,
    })
    async getStudents(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('isActive') isActive?: boolean,
    ): Promise<ApiResponseModel<StudentListDto>> {
        const students = await this.adminStudentsService.getStudents({ page, limit, search, isActive });
        return ApiResponseModel.success(students, 'Students retrieved successfully');
    }

    @Patch(':id/status')
    @ApiBody({ type: StudentUpdateStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Student status updated successfully',
        type: ApiResponseModel,
    })
    async updateStudentStatus(
        @Param('id') id: string,
        @Body() payload: StudentUpdateStatusDto,
    ): Promise<ApiResponseModel<Student>> {
        const student = await this.adminStudentsService.updateStudentStatus(id, payload);
        return ApiResponseModel.success(student, 'Student status updated successfully');
    }

    @Patch(':id/deletion')
    @ApiBody({ type: StudentUpdateDeletionDto })
    @ApiResponse({
        status: 200,
        description: 'Student deletion flag updated successfully',
        type: ApiResponseModel,
    })
    async updateStudentDeletion(
        @Param('id') id: string,
        @Body() payload: StudentUpdateDeletionDto,
    ): Promise<ApiResponseModel<Student>> {
        const student = await this.adminStudentsService.updateStudentDeletion(id, payload);
        return ApiResponseModel.success(student, 'Student deletion flag updated successfully');
    }
}
