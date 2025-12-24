import { Body, Controller, Get, Param, Patch, Query, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassStatus, UserRole } from 'src/modules/shared/enums';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { JwtAuthGuard } from 'src/modules/shared/guards/jwt-auth.guard';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import { AdminClassesService } from './classes.service';
import AdminClassListDto from './dto/admin-class-list.dto';
import AdminUpdateClassStatusDto from './dto/admin-update-class-status.dto';
import AdminUpdateClassScheduleDto from './dto/admin-update-class-schedule.dto';
import ClassEntity from 'src/database/entities/classes.entity';
import { AdminActionLoggerInterceptor } from '../../shared/interceptors/admin-action-logger.interceptor';

@ApiTags('Classes')
@Controller('admin/classes')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class AdminClassesController {
    constructor(private readonly adminClassesService: AdminClassesService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'status', enum: ClassStatus, required: false })
    @ApiResponse({
        status: 200,
        description: 'Classes retrieved successfully',
        type: ApiResponseModel,
    })
    async getClasses(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: ClassStatus,
    ): Promise<ApiResponseModel<AdminClassListDto>> {
        const classes = await this.adminClassesService.listClasses({ page, limit, search, status });
        return ApiResponseModel.success(classes, 'Classes retrieved successfully');
    }

    @Patch(':id/status')
    @ApiBody({ type: AdminUpdateClassStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Class status updated successfully',
        type: ApiResponseModel,
    })
    async updateStatus(
        @Param('id') id: string,
        @Body() payload: AdminUpdateClassStatusDto,
    ): Promise<ApiResponseModel<ClassEntity>> {
        const updated = await this.adminClassesService.updateStatus(id, payload);
        return ApiResponseModel.success(updated, 'Class status updated successfully');
    }

    @Patch(':id/schedule')
    @ApiBody({ type: AdminUpdateClassScheduleDto })
    @ApiResponse({
        status: 200,
        description: 'Class schedule updated successfully',
        type: ApiResponseModel,
    })
    async updateSchedule(
        @Param('id') id: string,
        @Body() payload: AdminUpdateClassScheduleDto,
    ): Promise<ApiResponseModel<ClassEntity>> {
        const updated = await this.adminClassesService.updateSchedule(id, payload);
        return ApiResponseModel.success(updated, 'Class schedule updated successfully');
    }
}

