import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/modules/shared/enums';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { AdminTeachersService } from './admin-teachers.service';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import TeacherListDto from './dto/teacher-list.dti';

@ApiTags('Teachers')
@Controller('admin/teachers')
@UseGuards(RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
export class TeachersController {
    constructor(private readonly adminTeachersService: AdminTeachersService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'isActive', type: 'boolean', required: false })
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
    ): Promise<ApiResponseModel<TeacherListDto>> {
        const teachers = await this.adminTeachersService.getTeachers({ page, limit, search, isActive });
        return ApiResponseModel.success(teachers, 'Teachers retrieved successfully');
    }
}
