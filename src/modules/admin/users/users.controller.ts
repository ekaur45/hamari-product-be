import { Body, Controller, Get, Patch, Post, Query, SetMetadata, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';  
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminUsersService } from './admin-users.service';
import { UserRole } from 'src/modules/shared/enums';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import AdminUsersListDto from './dto/admin-users-list.dto';
import User from 'src/database/entities/user.entity';
import AdminCreateUserDto from './dto/admin-create-user.dto';
import AdminUpdateUserStatusDto from './dto/admin-update-user-status.dto';
import AdminUpdateUserRoleDto from './dto/admin-update-user-role.dto';
import { AdminActionLoggerInterceptor } from '../../shared/interceptors/admin-action-logger.interceptor';
import AdminUpdateUserDeletionDto from './dto/admin-update-user-deletion.dto';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseGuards(RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@UseInterceptors(AdminActionLoggerInterceptor)
export class UsersController {
    constructor(private readonly adminUsersService: AdminUsersService){}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        type: ApiResponseModel,
    })
    async getUsers(

        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('role') role?: UserRole,
        @Query('isActive') isActive?: boolean,
    ): Promise<ApiResponseModel<AdminUsersListDto>> {
        const users = await this.adminUsersService.getUsers({ page, limit, search, role, isActive });
        return ApiResponseModel.success(users, 'Users retrieved successfully');
    }


    @Post()
    @ApiBody({ type: AdminCreateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User created successfully',
        type: ApiResponseModel<User>,
    })
    async createUser(@Body() createUserDto: AdminCreateUserDto): Promise<ApiResponseModel<User>> {
        const user = await this.adminUsersService.createUser(createUserDto);
        return ApiResponseModel.success(user, 'User created successfully');
    }

    @Patch(':id/status')
    @ApiBody({ type: AdminUpdateUserStatusDto })
    @ApiResponse({
        status: 200,
        description: 'User status updated successfully',
        type: ApiResponseModel<User>,
    })
    async updateUserStatus(
        @Param('id') id: string,
        @Body() payload: AdminUpdateUserStatusDto,
    ): Promise<ApiResponseModel<User>> {
        const user = await this.adminUsersService.updateUserStatus(id, payload);
        return ApiResponseModel.success(user, 'User status updated successfully');
    }

    @Patch(':id/role')
    @ApiBody({ type: AdminUpdateUserRoleDto })
    @ApiResponse({
        status: 200,
        description: 'User role updated successfully',
        type: ApiResponseModel<User>,
    })
    async updateUserRole(
        @Param('id') id: string,
        @Body() payload: AdminUpdateUserRoleDto,
    ): Promise<ApiResponseModel<User>> {
        const user = await this.adminUsersService.updateUserRole(id, payload);
        return ApiResponseModel.success(user, 'User role updated successfully');
    }

    @Patch(':id/deletion')
    @ApiBody({ type: AdminUpdateUserDeletionDto })
    @ApiResponse({
        status: 200,
        description: 'User deletion flag updated successfully',
        type: ApiResponseModel<User>,
    })
    async updateUserDeletion(
        @Param('id') id: string,
        @Body() payload: AdminUpdateUserDeletionDto,
    ): Promise<ApiResponseModel<User>> {
        const user = await this.adminUsersService.updateUserDeletion(id, payload);
        return ApiResponseModel.success(user, 'User deletion flag updated successfully');
    }
}
